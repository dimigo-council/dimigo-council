import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.ts';
import { Public } from './auth/session.guard.ts';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }
}
