import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { AdminOnly, StudentCouncilOnly } from '#/auth/session.guard';
import {
  councilDtoSchema,
  memberListQuerySchema,
  membershipDtoSchema,
  userListQuerySchema,
  type CouncilDto,
  type MemberListQuery,
  type MembershipDto,
  type UserListQuery,
} from '../dto/members.dto.ts';
import { MembersService } from '../providers/members.service.ts';

@Controller('/members')
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @StudentCouncilOnly()
  @Get('/')
  list(
    @Query({
      schema: memberListQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: MemberListQuery,
  ) {
    return this.members.listMembers(query);
  }

  @AdminOnly()
  @Put('/:userId/department')
  assignDepartment(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body({
      schema: membershipDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: MembershipDto,
  ) {
    return this.members.assignDepartment(userId, body);
  }

  @AdminOnly()
  @Delete('/:userId/department')
  removeFromDepartment(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.members.removeFromDepartment(userId);
  }

  @AdminOnly()
  @Put('/:userId/council')
  setCouncil(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body({ schema: councilDtoSchema, pipes: [StandardSchemaValidationPipe] })
    body: CouncilDto,
  ) {
    return this.members.setCouncil(userId, body.isStudentCouncil);
  }
}

@Controller('/admin/users')
export class AdminUsersController {
  constructor(private readonly members: MembersService) {}

  @AdminOnly()
  @Get('/')
  list(
    @Query({
      schema: userListQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: UserListQuery,
  ) {
    return this.members.listAllUsers(query);
  }
}
