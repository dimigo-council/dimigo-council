import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { SignJWT } from 'jose';
import { vi } from 'vitest';
import { Permission } from '../db/schema/index.ts';
import { SessionGuard, type AuthenticatedRequest } from './session.guard.ts';

const secret = 'a'.repeat(32);
const user = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'student@dimigo.hs.kr',
  permissions: 0,
  name: 'Student',
  pictureUrl: null,
  grade: 2,
  class: 3,
  gender: null,
  onboardingCompletedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

function context(authorization?: string): ExecutionContext {
  const request = { headers: { authorization } };
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function reflector(adminOnly = false, allowPending = false): Reflector {
  return {
    getAllAndOverride: vi.fn((key: string) =>
      key === 'adminOnly'
        ? adminOnly
        : key === 'allowPending'
          ? allowPending
          : false,
    ),
  } as unknown as Reflector;
}

function config(): ConfigService {
  return { getOrThrow: () => secret } as unknown as ConfigService;
}

async function tokenFor(
  claim: Omit<typeof user, 'onboardingCompletedAt'> & {
    onboardingCompletedAt: string | null;
  } = user,
  subject = claim.id,
): Promise<string> {
  return new SignJWT({ sid: 'session', user: claim })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(subject)
    .setIssuer('dimigo-council')
    .setAudience('dimigo-council')
    .setExpirationTime('15m')
    .sign(new TextEncoder().encode(secret));
}

describe('SessionGuard', () => {
  it('requires a valid bearer access token', async () => {
    const guard = new SessionGuard(reflector(), config());
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      guard.canActivate(context('Basic token')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      guard.canActivate(context('Bearer not-a-jwt')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      guard.canActivate(context(`Bearer ${await tokenFor(user, 'other')}`)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('loads the signed user snapshot without a database lookup', async () => {
    const requestContext = context(`Bearer ${await tokenFor()}`);
    await expect(
      new SessionGuard(reflector(), config()).canActivate(requestContext),
    ).resolves.toBe(true);
    const request = requestContext
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    expect(request.authSession).toEqual({
      user: {
        ...user,
        onboardingCompletedAt: new Date(user.onboardingCompletedAt),
        createdAt: new Date(user.createdAt),
      },
      sessionId: 'session',
    });
  });

  it('limits pending accounts to routes that allow onboarding', async () => {
    const token = await tokenFor({ ...user, onboardingCompletedAt: null });
    await expect(
      new SessionGuard(reflector(), config()).canActivate(
        context(`Bearer ${token}`),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new SessionGuard(reflector(false, true), config()).canActivate(
        context(`Bearer ${token}`),
      ),
    ).resolves.toBe(true);
  });

  it('checks the admin permission bit', async () => {
    await expect(
      new SessionGuard(reflector(true), config()).canActivate(
        context(`Bearer ${await tokenFor()}`),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new SessionGuard(reflector(true), config()).canActivate(
        context(
          `Bearer ${await tokenFor({ ...user, permissions: Permission.isAdmin })}`,
        ),
      ),
    ).resolves.toBe(true);
  });
});
