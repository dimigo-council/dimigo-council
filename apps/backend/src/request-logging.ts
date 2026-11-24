import { Logger, type INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export function configureRequestLogging(app: INestApplication): void {
  const logger = new Logger('HTTP');

  app.use((request: Request, response: Response, next: NextFunction) => {
    const startedAt = process.hrtime.bigint();

    response.once('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      const message = `${request.method} ${request.path} ${response.statusCode} ${durationMs.toFixed(1)}ms`;

      if (response.statusCode >= 500) {
        logger.error(message);
      } else if (response.statusCode >= 400) {
        logger.warn(message);
      } else {
        logger.log(message);
      }
    });

    next();
  });
}
