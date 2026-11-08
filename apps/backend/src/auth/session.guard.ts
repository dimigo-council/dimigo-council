import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import { Permission } from '../db/schema/index.ts';
import type { AuthUser } from './providers/auth.service.ts';

const TOKEN_ISSUER = 'dimigo-council';
const authUserClaim = z.object({
  id: z.string(),
  email: z.string(),
  permissions: z.number().int(),
  name: z.string().nullable(),
  pictureUrl: z.string().nullable(),
  grade: z.number().int().nullable(),
  class: z.number().int().nullable(),
  gender: z.string().nullable(),
  onboardingCompletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export const Public = () => SetMetadata('public', true);
export const AdminOnly = () => SetMetadata('adminOnly', true);
export const AllowPending = () => SetMetadata('allowPending', true);
export type AuthSession = { user: AuthUser; sessionId: string };
export type AuthenticatedRequest = Request & { authSession: AuthSession };
export type ProbablyAuthenticatedRequest = Request &
  Partial<Pick<AuthenticatedRequest, 'authSession'>>;

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  private async getSession(accessToken: string): Promise<AuthSession | null> {
    try {
      const secret = this.config.getOrThrow<string>('ACCESS_TOKEN_SECRET');
      if (Buffer.byteLength(secret) < 32) return null;
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(secret),
        {
          issuer: TOKEN_ISSUER,
          audience: TOKEN_ISSUER,
          algorithms: ['HS256'],
        },
      );
      if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string')
        return null;
      const parsed = authUserClaim.safeParse(payload.user);
      if (!parsed.success || parsed.data.id !== payload.sub) return null;
      return {
        sessionId: payload.sid,
        user: {
          ...parsed.data,
          onboardingCompletedAt: parsed.data.onboardingCompletedAt
            ? new Date(parsed.data.onboardingCompletedAt)
            : null,
          createdAt: new Date(parsed.data.createdAt),
        },
      };
    } catch {
      return null;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>('public', [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;

    // authenticate
    const request = context
      .switchToHttp()
      .getRequest<ProbablyAuthenticatedRequest>();
    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer '))
      throw new UnauthorizedException();
    const token = authorization.slice('Bearer '.length);
    const session = await this.getSession(token);
    if (!session) throw new UnauthorizedException();
    request.authSession = session;

    // permission check
    if (
      this.reflector.getAllAndOverride<boolean>('adminOnly', [
        context.getHandler(),
        context.getClass(),
      ]) &&
      (session.user.permissions & Permission.isAdmin) === 0
    )
      throw new ForbiddenException();
    if (
      !session.user.onboardingCompletedAt &&
      !this.reflector.getAllAndOverride<boolean>('allowPending', [
        context.getHandler(),
        context.getClass(),
      ])
    )
      throw new ForbiddenException('Complete onboarding first');

    return true;
  }
}
