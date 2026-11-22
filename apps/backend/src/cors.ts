import type { INestApplication } from '@nestjs/common';

export function configureCors(app: INestApplication, frontendOrigin?: string) {
  if (!frontendOrigin) return;

  const url = new URL(frontendOrigin);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('FRONTEND_ORIGIN must be a URL origin without a path');
  }

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allowed?: boolean) => void,
    ) => callback(null, origin === url.origin),
    credentials: true,
  });
}
