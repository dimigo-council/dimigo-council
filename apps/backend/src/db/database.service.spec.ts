import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseService } from './database.service.ts';

describe('DatabaseService', () => {
  it('fails initialization when the database connection check fails', async () => {
    const config = new ConfigService({
      DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/test',
    });
    const service = new DatabaseService(config);

    try {
      const pool = Reflect.get(service, 'pool') as Pool;
      const query = vi.spyOn(pool, 'query').mockRejectedValue(new Error('connection refused'));

      await expect(service.onModuleInit()).rejects.toThrow('connection refused');
      expect(query).toHaveBeenCalledWith('SELECT 1');
    } finally {
      await service.onModuleDestroy();
    }
  });

  it('handles an idle pool error without throwing', async () => {
    const logError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const config = new ConfigService({
      DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/test',
    });
    const service = new DatabaseService(config);

    try {
      const pool = Reflect.get(service, 'pool') as Pool;
      expect(() => pool.emit('error', new Error('connection lost'))).not.toThrow();
      expect(logError).toHaveBeenCalledWith(
        'Unexpected PostgreSQL error on an idle connection',
        expect.stringContaining('connection lost'),
      );
    } finally {
      await service.onModuleDestroy();
      logError.mockRestore();
    }
  });
});
