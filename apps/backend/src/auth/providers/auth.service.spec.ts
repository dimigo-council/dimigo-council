import { createHash } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { PgDialect } from 'drizzle-orm/pg-core';
import { decodeJwt } from 'jose';
import { vi } from 'vitest';
import { DatabaseService } from '#/db/database.service';
import { EmailCodeService } from './email-code.service.ts';
import { AuthService } from './auth.service.ts';

function mockGoogleLookup(
  results: Array<Array<{ id: string; googleSub: string | null }>>,
) {
  const limit = vi.fn();
  for (const result of results) limit.mockResolvedValueOnce(result);
  const where = vi.fn().mockReturnValue({ limit });
  const returning = vi.fn().mockResolvedValue([{ id: 'student-id' }]);
  const updateWhere = vi.fn().mockReturnValue({ returning });
  const set = vi.fn().mockReturnValue({ where: updateWhere });
  const db = {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({ where }),
    }),
    update: vi.fn().mockReturnValue({ set }),
  };
  const service = new AuthService(
    { db } as unknown as DatabaseService,
    {} as ConfigService,
    {} as EmailCodeService,
  );
  return { service, db, where, set, updateWhere, returning };
}

describe('AuthService Google account lookup', () => {
  const dialect = new PgDialect();

  it('finds an already linked account by subject after its email changes', async () => {
    const linkedUser = { id: 'student-id', googleSub: 'google-user-123' };
    const { service, db, where } = mockGoogleLookup([[linkedUser]]);

    await expect(
      service['findGoogleUser']('new-address@dimigo.hs.kr', 'google-user-123'),
    ).resolves.toBe(linkedUser);
    expect(where).toHaveBeenCalledTimes(1);
    expect(dialect.sqlToQuery(where.mock.calls[0][0]).sql).toContain(
      '"google_sub"',
    );
    expect(db.update).not.toHaveBeenCalled();
  });

  it('links an email account only when no subject is linked yet', async () => {
    const unlinkedUser = { id: 'student-id', googleSub: null };
    const { service, where, set, updateWhere } = mockGoogleLookup([
      [],
      [unlinkedUser],
    ]);

    await expect(
      service['findGoogleUser']('student@dimigo.hs.kr', 'google-user-123'),
    ).resolves.toBe(unlinkedUser);
    expect(where).toHaveBeenCalledTimes(2);
    expect(dialect.sqlToQuery(where.mock.calls[0][0]).sql).toContain(
      '"google_sub"',
    );
    expect(dialect.sqlToQuery(where.mock.calls[1][0]).sql).toContain('"email"');
    expect(set).toHaveBeenCalledWith({ googleSub: 'google-user-123' });
    expect(dialect.sqlToQuery(updateWhere.mock.calls[0][0]).sql).toContain(
      '"google_sub" is null',
    );
  });

  it('rejects an email account linked to another subject', async () => {
    const { service, db } = mockGoogleLookup([
      [],
      [{ id: 'student-id', googleSub: 'another-google-user' }],
    ]);

    await expect(
      service['findGoogleUser']('student@dimigo.hs.kr', 'google-user-123'),
    ).rejects.toThrow('Account is not registered');
    expect(db.update).not.toHaveBeenCalled();
  });
});

describe('AuthService tokens', () => {
  it('signs an updated user snapshot for the existing session after onboarding', async () => {
    const userId = '00000000-0000-0000-0000-000000000001';
    const sessionId = '00000000-0000-0000-0000-000000000002';
    const updatedUser = {
      id: userId,
      email: 'student@dimigo.hs.kr',
      permissions: 0,
      name: 'Student',
      pictureUrl: null,
      grade: 2,
      class: 3,
      gender: null,
      onboardingCompletedAt: new Date(),
      createdAt: new Date(),
    };
    const db = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      }),
    };
    const service = new AuthService(
      { db } as unknown as DatabaseService,
      {
        getOrThrow: () => 'a'.repeat(32),
      } as unknown as ConfigService,
      {} as EmailCodeService,
    );

    const result = await service.completeOnboarding(userId, sessionId, {
      name: 'Student',
      grade: 2,
      class: 3,
    });

    expect(result).toMatchObject({
      user: updatedUser,
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    expect(decodeJwt(result.accessToken)).toMatchObject({
      sub: userId,
      sid: sessionId,
      user: {
        ...updatedUser,
        onboardingCompletedAt: updatedUser.onboardingCompletedAt.toISOString(),
        createdAt: updatedUser.createdAt.toISOString(),
      },
    });
  });

  it('rotates a hashed refresh token and signs the user snapshot', async () => {
    const userId = '00000000-0000-0000-0000-000000000001';
    const sessionId = '00000000-0000-0000-0000-000000000002';
    const user = {
      id: userId,
      email: 'student@dimigo.hs.kr',
      permissions: 0,
      name: 'Student',
      pictureUrl: null,
      grade: 2,
      class: 3,
      gender: null,
      onboardingCompletedAt: new Date(),
      createdAt: new Date(),
    };
    let storedHash = '';
    const db = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockImplementation((values: { tokenHash: string }) => {
          storedHash = values.tokenHash;
          return {
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([
                {
                  id: sessionId,
                  userId,
                  expiresAt: new Date(Date.now() + 60_000),
                },
              ]),
            }),
          };
        }),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([user]),
          }),
        }),
      }),
    };
    const config = {
      getOrThrow: (key: string) => {
        if (key === 'ACCESS_TOKEN_SECRET') return 'a'.repeat(32);
        throw new Error(`Unexpected config: ${key}`);
      },
    };
    const service = new AuthService(
      { db } as unknown as DatabaseService,
      config as unknown as ConfigService,
      {} as EmailCodeService,
    );

    const tokens = await service.refresh('old-refresh-token');
    expect(tokens.refreshToken).not.toBe('old-refresh-token');
    expect(storedHash).toBe(
      createHash('sha256').update(tokens.refreshToken).digest('hex'),
    );
    expect(storedHash).not.toBe(tokens.refreshToken);
    expect(tokens.expiresIn).toBe(900);
    expect(tokens.refreshMaxAge).toBeGreaterThan(0);
    expect(tokens.refreshMaxAge).toBeLessThanOrEqual(60_000);
    expect(decodeJwt(tokens.accessToken)).toMatchObject({
      sub: userId,
      sid: sessionId,
      user: {
        ...user,
        onboardingCompletedAt: user.onboardingCompletedAt.toISOString(),
        createdAt: user.createdAt.toISOString(),
      },
    });
  });
});
