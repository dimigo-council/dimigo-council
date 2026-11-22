import { Module } from '@nestjs/common';
import * as controllers from './controllers/index.ts';
import { ActivitiesService } from './providers/index.ts';

@Module({
  controllers: Object.values(controllers),
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
