import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.ts';
import { configureCors } from './cors.ts';
import { configureRequestLogging } from './request-logging.ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureRequestLogging(app);
  configureCors(app, app.get(ConfigService).get<string>('FRONTEND_ORIGIN'));
  app.enableShutdownHooks();
  await app.listen(3000);
}
await bootstrap();
