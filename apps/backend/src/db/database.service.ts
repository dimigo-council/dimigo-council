import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import * as schema from './schema/index.ts';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;
  readonly db: NodePgDatabase<typeof schema>;

  constructor(config: ConfigService) {
    const connectionString = config.getOrThrow<string>('DATABASE_URL');
    this.pool = new Pool({ connectionString });
    this.pool.on('error', (error: Error) => {
      this.logger.error(
        'Unexpected PostgreSQL error on an idle connection',
        error.stack,
      );
    });
    this.db = drizzle({ client: this.pool, schema });
  }

  async onModuleInit(): Promise<void> {
    await this.pool.query('SELECT 1');
    this.logger.log('PostgreSQL connection established');

    const client = await this.pool.connect();
    try {
      await client.query(
        "SELECT pg_advisory_lock(hashtext('dimigo-council'), hashtext('drizzle-migrations'))",
      );
      try {
        await migrate(drizzle({ client, schema }), {
          migrationsFolder: fileURLToPath(
            new URL('../../drizzle/', import.meta.url),
          ),
        });
        this.logger.log('Database migrations applied');
      } finally {
        await client.query(
          "SELECT pg_advisory_unlock(hashtext('dimigo-council'), hashtext('drizzle-migrations'))",
        );
      }
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
