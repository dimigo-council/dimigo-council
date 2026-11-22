import { Module } from '@nestjs/common';
import * as controllers from './controllers/index.ts';
import { SurveysService } from './providers/index.ts';

@Module({
  controllers: Object.values(controllers),
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
