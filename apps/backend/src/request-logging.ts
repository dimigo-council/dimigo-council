import { Logger, type INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { ProbablyAuthenticatedRequest } from './auth/session.guard.ts';
import { DatabaseService } from './db/database.service.ts';
import { requests } from './db/schema/index.ts';

function safeLogValue(value: string): string {
  return value.replace(/[\r\n]/g, ' ');
}

export function configureRequestLogging(app: INestApplication): void {
  const logger = new Logger('CustomLoggerMiddleware');
  const database = app.get(DatabaseService);

  app.use((request: Request, response: Response, next: NextFunction) => {
    const startedAt = Date.now();
    const ip = safeLogValue(
      String(
        request.headers['cf-connecting-ip'] ??
          request.socket.remoteAddress ??
          'unknown',
      ),
    );
    const forwardedForHeader = request.headers['x-forwarded-for'];
    const forwardedFor = forwardedForHeader
      ? safeLogValue(
          Array.isArray(forwardedForHeader)
            ? forwardedForHeader.join(' > ')
            : forwardedForHeader.replace(/,/g, ' > '),
        )
      : undefined;
    const userAgent = request.headers['user-agent']
      ? safeLogValue(request.headers['user-agent'])
      : null;
    const originURL = request.path;
    const httpVersion = `HTTP/${request.httpVersion}`;

    response.once('finish', () => {
      const durationMs = Date.now() - startedAt;
      const session = (request as ProbablyAuthenticatedRequest).authSession;
      const authorization = session
        ? `${session.user.id}(${safeLogValue(session.user.name ?? 'unknown')})`
        : request.headers.authorization
          ? 'failed'
          : 'unknown';

      logger.log(
        `From ${forwardedFor ? `${forwardedFor} through ${ip}` : ip} (${userAgent ?? 'undefined'}) - Requested "${request.method} ${originURL} ${httpVersion}" | Responded with HTTP ${response.statusCode} by uid{${authorization}} +${durationMs}ms`,
      );

      void database.db
        .insert(requests)
        .values({
          ip,
          userAgent,
          reqMethod: request.method,
          originURL,
          httpVersion,
          statusCode: response.statusCode,
          authorization,
          durationMs,
        })
        .catch((error: unknown) =>
          logger.error('Failed to log request to DB', error),
        );
    });

    next();
  });
}
