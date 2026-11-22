import type { INestApplication, Provider, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { SignJWT } from 'jose';
import type { App } from 'supertest/types.js';
import { SessionGuard } from '../src/auth/session.guard.ts';
import { Permission } from '../src/db/schema/index.ts';

const ACCESS_TOKEN_SECRET = 'a'.repeat(32);

export const ids = {
  student: '00000000-0000-4000-8000-000000000001',
  council: '00000000-0000-4000-8000-000000000002',
  admin: '00000000-0000-4000-8000-000000000003',
};

export function userClaim(id: string, permissions: number) {
  return {
    id,
    email: `${id.slice(-4)}@dimigo.hs.kr`,
    permissions,
    name: 'Tester',
    pictureUrl: null,
    grade: 2,
    class: 3,
    gender: null,
    onboardingCompletedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

async function sign(user: ReturnType<typeof userClaim>): Promise<string> {
  const token = await new SignJWT({ sid: 'session-id', user })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuer('dimigo-council')
    .setAudience('dimigo-council')
    .setExpirationTime('15m')
    .sign(new TextEncoder().encode(ACCESS_TOKEN_SECRET));
  return `Bearer ${token}`;
}

/** Bearer headers for a student, a council member, an admin, and a pending account. */
export async function bearerTokens() {
  return {
    student: await sign(userClaim(ids.student, 0)),
    council: await sign(userClaim(ids.council, Permission.isStudentCouncil)),
    admin: await sign(userClaim(ids.admin, Permission.isAdmin)),
    pending: await sign({
      ...userClaim(ids.student, 0),
      onboardingCompletedAt: null as never,
    }),
  };
}

/** A Nest app with the real SessionGuard and the given controllers and mocked services. */
export async function createApp(
  controllers: Type[],
  providers: Provider[],
): Promise<INestApplication<App>> {
  const module = await Test.createTestingModule({
    controllers,
    providers: [
      ...providers,
      {
        provide: ConfigService,
        useValue: {
          get: () => ACCESS_TOKEN_SECRET,
          getOrThrow: () => ACCESS_TOKEN_SECRET,
        },
      },
      { provide: APP_GUARD, useClass: SessionGuard },
    ],
  }).compile();
  const app = module.createNestApplication<INestApplication<App>>();
  await app.init();
  return app;
}
