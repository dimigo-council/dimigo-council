import { Controller, Get, Req } from '@nestjs/common';
import {
  StudentCouncilOnly,
  type AuthenticatedRequest,
} from '#/auth/session.guard';
import { HomeService } from '../providers/home.service.ts';

@Controller('/home')
export class HomeController {
  constructor(private readonly home: HomeService) {}

  @Get('/student')
  student(@Req() request: AuthenticatedRequest) {
    return this.home.student(request.authSession.user);
  }

  @StudentCouncilOnly()
  @Get('/council')
  council(@Req() request: AuthenticatedRequest) {
    return this.home.council(request.authSession.user);
  }
}
