import { Module } from '@nestjs/common';
import * as controllers from './controllers/index.ts';
import { TasksService } from './providers/index.ts';

@Module({
  controllers: Object.values(controllers),
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
