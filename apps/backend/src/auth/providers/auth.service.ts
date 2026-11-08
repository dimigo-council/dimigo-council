import { createHash, randomBytes } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { SignJWT } from 'jose';
import * as oidc from 'openid-client';
import { DatabaseService } from '#/db/database.service';
import { oauthFlows, sessions, users } from '#/db/schema/index';
import { EmailCodeService } from './email-code.service.ts';
import type { OnboardingDto } from '../dto/auth.dto.ts';
import {
  SCHOOL_DOMAIN,
  schoolEmail,
  verifiedSchoolGoogleIdentity,
} from '../helpers/school-identity.ts';

type Purpose = 'signup' | 'login';
const ACCESS_LIFETIME_SECONDS = 15 * 60;
const OAUTH_LIFETIME_MS = 10 * 60 * 1000;
const REFRESH_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const TOKEN_ISSUER = 'dimigo-council';

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export type AuthUser = Pick<
  typeof users.$inferSelect,
  | 'id'
  | 'email'
  | 'permissions'
  | 'name'
  | 'pictureUrl'
  | 'grade'
  | 'class'
  | 'gender'
  | 'onboardingCompletedAt'
  | 'createdAt'
>;
@Injectable()
export class AuthService {
  private googleConfig?: oidc.Configuration;

  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService,
    private readonly emailCodes: EmailCodeService,
  ) {}

  private get db(): DatabaseService['db'] {
    return this.database.db;
  }

  private accessKey(): Uint8Array {
    const secret = this.config.getOrThrow<string>('ACCESS_TOKEN_SECRET');
    if (Buffer.byteLength(secret) < 32)
      throw new Error('ACCESS_TOKEN_SECRET must contain at least 32 bytes');
    return new TextEncoder().encode(secret);
  }

  private async signAccessToken(userId: string, sessionId: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        permissions: users.permissions,
        name: users.name,
        pictureUrl: users.pictureUrl,
        grade: users.grade,
        class: users.class,
        gender: users.gender,
        onboardingCompletedAt: users.onboardingCompletedAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new UnauthorizedException();
    return new SignJWT({
      sid: sessionId,
      user: {
        ...user,
        onboardingCompletedAt:
          user.onboardingCompletedAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
      },
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuer(TOKEN_ISSUER)
      .setAudience(TOKEN_ISSUER)
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_LIFETIME_SECONDS}s`)
      .sign(this.accessKey());
  }

  private async issueTokens(userId: string) {
    const refreshToken = randomBytes(32).toString('base64url');
    const [session] = await this.db
      .insert(sessions)
      .values({
        tokenHash: digest(refreshToken),
        userId,
        expiresAt: new Date(Date.now() + REFRESH_LIFETIME_MS),
      })
      .returning({ id: sessions.id });
    return {
      accessToken: await this.signAccessToken(userId, session.id),
      refreshToken,
      expiresIn: ACCESS_LIFETIME_SECONDS,
      refreshMaxAge: REFRESH_LIFETIME_MS,
    };
  }

  async refresh(refreshToken: string) {
    const newRefreshToken = randomBytes(32).toString('base64url');
    const [session] = await this.db
      .update(sessions)
      .set({ tokenHash: digest(newRefreshToken) })
      .where(
        and(
          eq(sessions.tokenHash, digest(refreshToken)),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .returning({
        id: sessions.id,
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
      });
    if (!session) throw new UnauthorizedException();
    return {
      accessToken: await this.signAccessToken(session.userId, session.id),
      refreshToken: newRefreshToken,
      expiresIn: ACCESS_LIFETIME_SECONDS,
      refreshMaxAge: Math.max(0, session.expiresAt.getTime() - Date.now()),
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async completeOnboarding(
    userId: string,
    sessionId: string,
    details: OnboardingDto,
  ): Promise<{
    user: AuthUser;
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
  }> {
    const [user] = await this.db
      .update(users)
      .set({
        name: details.name,
        grade: details.grade ?? null,
        class: details.class ?? null,
        pictureUrl: details.pictureUrl ?? null,
        gender: details.gender ?? null,
        onboardingCompletedAt: new Date(),
      })
      .where(and(eq(users.id, userId), isNull(users.onboardingCompletedAt)))
      .returning({
        id: users.id,
        email: users.email,
        permissions: users.permissions,
        name: users.name,
        pictureUrl: users.pictureUrl,
        grade: users.grade,
        class: users.class,
        gender: users.gender,
        onboardingCompletedAt: users.onboardingCompletedAt,
        createdAt: users.createdAt,
      });
    if (!user) throw new ConflictException('Onboarding is already complete');
    return {
      user,
      accessToken: await this.signAccessToken(userId, sessionId),
      tokenType: 'Bearer',
      expiresIn: ACCESS_LIFETIME_SECONDS,
    };
  }

  private async configuration(): Promise<oidc.Configuration> {
    this.googleConfig ??= await oidc.discovery(
      new URL('https://accounts.google.com'),
      this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
    );
    return this.googleConfig;
  }

  async startGoogle(purpose: Purpose): Promise<{ url: string; state: string }> {
    const redirectUri = this.config.getOrThrow<string>(
      purpose === 'signup'
        ? 'GOOGLE_SIGNUP_REDIRECT_URI'
        : 'GOOGLE_LOGIN_REDIRECT_URI',
    );
    const config = await this.configuration();
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
    await this.db.insert(oauthFlows).values({
      stateHash: digest(state),
      purpose,
      redirectUri,
      codeVerifier,
      nonce,
      expiresAt: new Date(Date.now() + OAUTH_LIFETIME_MS),
    });
    const url = oidc.buildAuthorizationUrl(config, {
      redirect_uri: redirectUri,
      scope: 'openid email profile',
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      nonce,
      hd: SCHOOL_DOMAIN,
      prompt: 'select_account',
    });
    return { url: url.href, state };
  }

  async finishGoogle(
    purpose: Purpose,
    callbackUrl: URL,
    state: string,
    cookieState: string | undefined,
  ) {
    if (!cookieState || state !== cookieState)
      throw new UnauthorizedException('Invalid Google sign-in state');
    const [flow] = await this.db
      .delete(oauthFlows)
      .where(
        and(
          eq(oauthFlows.stateHash, digest(state)),
          eq(oauthFlows.purpose, purpose),
          gt(oauthFlows.expiresAt, new Date()),
        ),
      )
      .returning();
    if (!flow) throw new UnauthorizedException('Google sign-in expired');
    if (callbackUrl.origin + callbackUrl.pathname !== flow.redirectUri)
      throw new UnauthorizedException('Invalid Google callback URL');
    const config = await this.configuration();
    const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
      pkceCodeVerifier: flow.codeVerifier,
      expectedState: state,
      expectedNonce: flow.nonce,
    });
    const { email, googleSub } = verifiedSchoolGoogleIdentity(tokens.claims());
    const user =
      purpose === 'signup'
        ? await this.createGoogleUser(email, googleSub)
        : await this.findGoogleUser(email, googleSub);
    return this.issueTokens(user.id);
  }

  private async createGoogleUser(email: string, googleSub: string) {
    const [user] = await this.db
      .insert(users)
      .values({ email, googleSub })
      .onConflictDoNothing()
      .returning({ id: users.id });
    if (!user) throw new ConflictException('Account already exists');
    return user;
  }

  private async findGoogleUser(email: string, googleSub: string) {
    const [linkedUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.googleSub, googleSub))
      .limit(1);
    if (linkedUser) return linkedUser;

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user || user.googleSub)
      throw new UnauthorizedException('Account is not registered');
    const [linked] = await this.db
      .update(users)
      .set({ googleSub })
      .where(and(eq(users.id, user.id), isNull(users.googleSub)))
      .returning({ id: users.id });
    if (!linked) throw new UnauthorizedException('Account is not registered');
    return user;
  }

  async requestEmailCode(emailInput: string, purpose: Purpose): Promise<void> {
    const email = schoolEmail(emailInput);
    const [user] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if ((purpose === 'signup' && user) || (purpose === 'login' && !user))
      return;
    await this.emailCodes.send(email, purpose);
  }

  async finishEmailCode(emailInput: string, purpose: Purpose, code: string) {
    const email = schoolEmail(emailInput);
    await this.emailCodes.consume(email, purpose, code);
    if (purpose === 'signup') {
      const [user] = await this.db
        .insert(users)
        .values({ email })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id });
      if (!user) throw new ConflictException('Account already exists');
      return this.issueTokens(user.id);
    }
    const [user] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) throw new UnauthorizedException('Account is not registered');
    return this.issueTokens(user.id);
  }
}
