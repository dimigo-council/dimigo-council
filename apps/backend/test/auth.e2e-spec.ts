import { Controller, Get, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { SignJWT } from 'jose';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { vi } from 'vitest';
import { AuthController } from '../src/auth/controllers/auth.controller.ts';
import { AuthService } from '../src/auth/providers/auth.service.ts';
import { UserService } from '../src/auth/providers/user.service.ts';
import { SessionGuard } from '../src/auth/session.guard.ts';

@Controller()
class ProtectedController {
  @Get('/protected')
  getProtected() {
    return 'ok';
  }
}

describe('authentication routes (e2e)', () => {
  let app: INestApplication<App>;
  const user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'student@dimigo.hs.kr',
    permissions: 0,
    name: null,
    pictureUrl: null,
    grade: null,
    class: null,
    gender: null,
    onboardingCompletedAt: null,
    createdAt: new Date(),
  };
  const tokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 900,
    refreshMaxAge: 604_800_000,
  };
  const auth = {
    startGoogle: vi.fn().mockResolvedValue({
      url: 'https://accounts.google.com/example',
      state: 'state',
    }),
    finishGoogle: vi.fn().mockResolvedValue(tokens),
    requestEmailCode: vi.fn().mockResolvedValue(undefined),
    finishEmailCode: vi.fn().mockResolvedValue(tokens),
    completeOnboarding: vi
      .fn()
      .mockImplementation(async (_id, sessionId, details) => {
        const updatedUser = {
          ...user,
          ...details,
          onboardingCompletedAt: new Date(),
        };
        const accessToken = await new SignJWT({
          sid: sessionId,
          user: {
            ...updatedUser,
            onboardingCompletedAt:
              updatedUser.onboardingCompletedAt.toISOString(),
            createdAt: updatedUser.createdAt.toISOString(),
          },
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setSubject(user.id)
          .setIssuer('dimigo-council')
          .setAudience('dimigo-council')
          .setExpirationTime('15m')
          .sign(new TextEncoder().encode(settings.ACCESS_TOKEN_SECRET));
        return {
          user: updatedUser,
          accessToken,
          tokenType: 'Bearer',
          expiresIn: 900,
        };
      }),
    refresh: vi.fn().mockResolvedValue(tokens),
    logout: vi.fn().mockResolvedValue(undefined),
  };
  const settings: Record<string, string> = {
    ACCESS_TOKEN_SECRET: 'a'.repeat(32),
    GOOGLE_SIGNUP_REDIRECT_URI: 'http://localhost:5173/google/signup/callback',
    GOOGLE_LOGIN_REDIRECT_URI: 'http://localhost:5173/google/login/callback',
  };

  beforeAll(async () => {
    tokens.accessToken = await new SignJWT({
      sid: 'session-id',
      user: {
        ...user,
        onboardingCompletedAt: null,
        createdAt: user.createdAt.toISOString(),
      },
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuer('dimigo-council')
      .setAudience('dimigo-council')
      .setExpirationTime('15m')
      .sign(new TextEncoder().encode(settings.ACCESS_TOKEN_SECRET));
    const module = await Test.createTestingModule({
      controllers: [AuthController, ProtectedController],
      providers: [
        { provide: AuthService, useValue: auth },
        {
          provide: UserService,
          useValue: { getProfile: vi.fn().mockResolvedValue(user) },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => settings[key],
            getOrThrow: (key: string) => {
              if (!settings[key]) throw new Error(`${key} is required`);
              return settings[key];
            },
          },
        },
        { provide: APP_GUARD, useClass: SessionGuard },
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('requires a bearer token and reads the current profile', async () => {
    await request(app.getHttpServer()).get('/auth/ping').expect(401);
    const profile = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(200);
    expect(profile.body.email).toBe(user.email);
  });

  it('validates email codes and returns only the access token in JSON', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup/email')
      .send({ email: 'invalid' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/auth/signup/email')
      .send({ email: user.email })
      .expect(202);
    expect(auth.requestEmailCode).toHaveBeenCalledWith(user.email, 'signup');
    await request(app.getHttpServer())
      .post('/auth/signup/email/callback')
      .send({ email: user.email, code: '123' })
      .expect(400);
    const response = await request(app.getHttpServer())
      .post('/auth/signup/email/callback')
      .send({ email: user.email, code: '123456' })
      .expect(200);
    expect(response.body).toEqual({
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    expect(response.headers['set-cookie'][0]).toMatch(/^refresh_token=/);
    expect(response.headers['set-cookie'][0]).toContain('Path=/auth/refresh');
    expect(response.body.refreshToken).toBeUndefined();
  });

  it('returns Google authorization URLs and completes the matching callback', async () => {
    const start = await request(app.getHttpServer())
      .get('/auth/signup/google')
      .expect(200);
    expect(start.body).toEqual({ url: 'https://accounts.google.com/example' });
    expect(start.headers['set-cookie'][0]).toMatch(/^oauth_state=/);
    const callback = await request(app.getHttpServer())
      .post('/auth/signup/google/callback')
      .set('Cookie', 'oauth_state=state')
      .send({
        state: 'state',
        code: 'code',
        iss: 'https://accounts.google.com',
      })
      .expect(200);
    expect(callback.body.accessToken).toBe(tokens.accessToken);
    expect(auth.finishGoogle).toHaveBeenCalledWith(
      'signup',
      new URL(
        'http://localhost:5173/google/signup/callback?code=code&state=state&iss=https%3A%2F%2Faccounts.google.com',
      ),
      'state',
      'state',
    );
    await request(app.getHttpServer())
      .post('/auth/signup/google/callback')
      .send({ state: 'state' })
      .expect(400);
  });

  it('returns an access token that can use protected routes after onboarding', async () => {
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .post('/auth/signup/onboarding')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ name: 'Student', class: 2 })
      .expect(400);
    const completed = await request(app.getHttpServer())
      .post('/auth/signup/onboarding')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({ name: 'Student', grade: 2, class: 2 })
      .expect(200);
    expect(auth.completeOnboarding).toHaveBeenCalledWith(
      user.id,
      'session-id',
      { name: 'Student', grade: 2, class: 2 },
    );
    expect(completed.body).toMatchObject({
      user: { id: user.id, name: 'Student' },
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${completed.body.accessToken}`)
      .expect(200);
    const refreshed = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', 'refresh_token=old-token')
      .expect(200);
    expect(refreshed.headers['set-cookie'][0]).toMatch(/^refresh_token=/);
    expect(auth.refresh).toHaveBeenCalledWith('old-token');
  });

  it('revokes logout for a bearer session', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .expect(204);
    expect(auth.logout).toHaveBeenCalledWith('session-id');
  });
});
