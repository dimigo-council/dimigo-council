import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { PG_UNIQUE_VIOLATION, pgErrorCode } from '#/common/database-errors';
import { DatabaseService } from '#/db/database.service';
import { departments } from '#/db/schema/index';

@Injectable()
export class DepartmentsService {
  constructor(private readonly database: DatabaseService) {}

  private get db(): DatabaseService['db'] {
    return this.database.db;
  }

  list() {
    return this.db
      .select({ id: departments.id, name: departments.name })
      .from(departments)
      .orderBy(asc(departments.id));
  }

  async create(name: string) {
    try {
      const [created] = await this.db
        .insert(departments)
        .values({ name })
        .returning({ id: departments.id, name: departments.name });
      return created;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async rename(id: number, name: string) {
    let updated: { id: number; name: string } | undefined;
    try {
      [updated] = await this.db
        .update(departments)
        .set({ name })
        .where(eq(departments.id, id))
        .returning({ id: departments.id, name: departments.name });
    } catch (error) {
      throw this.mapError(error);
    }
    if (!updated) throw new NotFoundException('Department not found');
    return updated;
  }

  /** Memberships go with the department; activities, tasks, inquiries and surveys keep no department. */
  async remove(id: number): Promise<void> {
    const deleted = await this.db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning({ id: departments.id });
    if (deleted.length === 0)
      throw new NotFoundException('Department not found');
  }

  private mapError(error: unknown) {
    return pgErrorCode(error) === PG_UNIQUE_VIOLATION
      ? new ConflictException('Department name already exists')
      : error;
  }
}
