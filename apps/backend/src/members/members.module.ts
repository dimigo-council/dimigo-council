import { Module } from '@nestjs/common';
import * as controllers from './controllers/index.ts';
import { DepartmentsService, MembersService } from './providers/index.ts';

@Module({
  controllers: Object.values(controllers),
  providers: [DepartmentsService, MembersService],
  exports: [DepartmentsService, MembersService],
})
export class MembersModule {}
