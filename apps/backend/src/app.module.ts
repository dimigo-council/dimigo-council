import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';
import { ActivitiesModule } from './activities/activities.module.ts';
import { AuthModule } from './auth/auth.module.ts';
import { DatabaseModule } from './db/database.module.ts';
import { HomeModule } from './home/home.module.ts';
import { InquiriesModule } from './inquiries/inquiries.module.ts';
import { MembersModule } from './members/members.module.ts';
import { SurveysModule } from './surveys/surveys.module.ts';
import { TasksModule } from './tasks/tasks.module.ts';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    MembersModule,
    ActivitiesModule,
    TasksModule,
    SurveysModule,
    InquiriesModule,
    HomeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
