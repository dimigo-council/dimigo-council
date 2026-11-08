import { createHmac, randomInt } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { DatabaseService } from '#/db/database.service';
import { emailCodes } from '#/db/schema/index';
import { GmailService } from './gmail.service.ts';

type Purpose = 'signup' | 'login';
const CODE_LIFETIME_MS = 10 * 60 * 1000;
const SEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

@Injectable()
export class EmailCodeService {
  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService,
    private readonly gmail: GmailService,
  ) {}

  private get db(): DatabaseService['db'] {
    return this.database.db;
  }

  private hash(email: string, purpose: Purpose, code: string): string {
    const secret = this.config.getOrThrow<string>('EMAIL_CODE_SECRET');
    if (Buffer.byteLength(secret) < 32)
      throw new Error('EMAIL_CODE_SECRET must contain at least 32 bytes');
    return createHmac('sha256', secret)
      .update(`${purpose}:${email}:${code}`)
      .digest('hex');
  }

  async send(email: string, purpose: Purpose): Promise<void> {
    const code = randomInt(1_000_000).toString().padStart(6, '0');
    const codeHash = this.hash(email, purpose, code);
    const now = new Date();
    const [saved] = await this.db
      .insert(emailCodes)
      .values({
        email,
        purpose,
        codeHash,
        expiresAt: new Date(now.getTime() + CODE_LIFETIME_MS),
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: [emailCodes.email, emailCodes.purpose],
        set: {
          codeHash,
          attempts: 0,
          expiresAt: new Date(now.getTime() + CODE_LIFETIME_MS),
          createdAt: now,
        },
        setWhere: lt(
          emailCodes.createdAt,
          new Date(now.getTime() - SEND_COOLDOWN_MS),
        ),
      })
      .returning({ codeHash: emailCodes.codeHash });
    // Keep request responses identical whether the account exists or not.
    if (!saved) return;
    try {
      await this.gmail.sendCode(email, code);
    } catch (error) {
      await this.db
        .delete(emailCodes)
        .where(
          and(
            eq(emailCodes.email, email),
            eq(emailCodes.purpose, purpose),
            eq(emailCodes.codeHash, codeHash),
          ),
        );
      throw error;
    }
  }

  async consume(email: string, purpose: Purpose, code: string): Promise<void> {
    const codeHash = this.hash(email, purpose, code);
    const now = new Date();
    const [used] = await this.db
      .delete(emailCodes)
      .where(
        and(
          eq(emailCodes.email, email),
          eq(emailCodes.purpose, purpose),
          eq(emailCodes.codeHash, codeHash),
          gt(emailCodes.expiresAt, now),
          lt(emailCodes.attempts, MAX_ATTEMPTS),
        ),
      )
      .returning({ email: emailCodes.email });
    if (used) return;
    await this.db
      .update(emailCodes)
      .set({ attempts: sql`${emailCodes.attempts} + 1` })
      .where(
        and(
          eq(emailCodes.email, email),
          eq(emailCodes.purpose, purpose),
          gt(emailCodes.expiresAt, now),
          lt(emailCodes.attempts, MAX_ATTEMPTS),
        ),
      );
    throw new UnauthorizedException('Invalid or expired verification code');
  }
}
