import { Injectable } from '@nestjs/common';
import { DatabaseService } from '#/db/database.service';
import { users } from '#/db/schema/index';
import { eq } from 'drizzle-orm';
import { NotFoundException } from '@nestjs/common';
import { Users } from '../../db/schema/index.ts';

@Injectable()
export class UserService {
  constructor(private readonly database: DatabaseService) {}

  private get db(): DatabaseService['db'] {
    return this.database.db;
  }

  async getProfile(userId: string): Promise<Users> {
    const [profile] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!profile) throw new NotFoundException();
    return profile;
  }
}
