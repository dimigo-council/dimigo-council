import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { lt } from 'drizzle-orm';
import { DatabaseService } from '#/db/database.service';
import { emailCodes, oauthFlows, sessions } from '#/db/schema/index';

@Injectable()
export class AuthCleanupService {
  constructor(private readonly database: DatabaseService) {}

  private get db(): DatabaseService['db'] {
    return this.database.db;
  }

  @Cron('0 */10 * * * *', { waitForCompletion: true })
  async deleteExpiredFlows(): Promise<void> {
    await this.db
      .delete(oauthFlows)
      .where(lt(oauthFlows.expiresAt, new Date()));
  }

  @Cron('0 */10 * * * *', { waitForCompletion: true })
  async deleteExpiredSessions(): Promise<void> {
    await this.db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  @Cron('0 */10 * * * *', { waitForCompletion: true })
  async deleteExpiredEmailCodes(): Promise<void> {
    await this.db
      .delete(emailCodes)
      .where(lt(emailCodes.expiresAt, new Date()));
  }
}
