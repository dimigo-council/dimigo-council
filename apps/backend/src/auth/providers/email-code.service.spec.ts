import { ConfigService } from '@nestjs/config';
import { vi } from 'vitest';
import { DatabaseService } from '#/db/database.service';
import { EmailCodeService } from './email-code.service.ts';
import { GmailService } from './gmail.service.ts';

describe('EmailCodeService', () => {
  it('silently suppresses a request inside the send cooldown', async () => {
    const returning = vi.fn().mockResolvedValueOnce([{ codeHash: 'saved' }]);
    returning.mockResolvedValueOnce([]);
    const db = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({ returning }),
        }),
      }),
    };
    const sendCode = vi.fn().mockResolvedValue(undefined);
    const service = new EmailCodeService(
      { db } as unknown as DatabaseService,
      { getOrThrow: () => 'a'.repeat(32) } as unknown as ConfigService,
      { sendCode } as unknown as GmailService,
    );

    await expect(
      service.send('student@dimigo.hs.kr', 'signup'),
    ).resolves.toBeUndefined();
    await expect(
      service.send('student@dimigo.hs.kr', 'signup'),
    ).resolves.toBeUndefined();
    expect(sendCode).toHaveBeenCalledTimes(1);
  });
});
