import { Module } from '@nestjs/common';
import * as controllers from './controllers/index.ts';
import { HomeService } from './providers/index.ts';

@Module({
  controllers: Object.values(controllers),
  providers: [HomeService],
})
export class HomeModule {}
