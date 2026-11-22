import { Module } from '@nestjs/common';
import { ActivitiesModule } from '#/activities/activities.module';
import * as controllers from './controllers/index.ts';
import { InquiriesService } from './providers/index.ts';

@Module({
  imports: [ActivitiesModule],
  controllers: Object.values(controllers),
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
