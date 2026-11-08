import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import * as controllers from './controllers/index.ts';
import * as providers from './providers/index.ts';
import { SessionGuard } from './session.guard.ts';

@Module({
  controllers: Object.values(controllers),
  providers: [
    ...Object.values(providers),
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class AuthModule {}
