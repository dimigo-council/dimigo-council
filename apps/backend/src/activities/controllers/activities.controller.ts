import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import {
  Public,
  StudentCouncilOnly,
  type AuthenticatedRequest,
} from '#/auth/session.guard';
import {
  activityDraftDtoSchema,
  activityListQuerySchema,
  activityScopeDtoSchema,
  createActivityDtoSchema,
  historyDtoSchema,
  landingQuerySchema,
  updateActivityDtoSchema,
  type ActivityDraftDto,
  type ActivityListQuery,
  type ActivityScopeDto,
  type CreateActivityDto,
  type HistoryDto,
  type LandingQuery,
  type UpdateActivityDto,
} from '../dto/activities.dto.ts';
import { ActivitiesService } from '../providers/activities.service.ts';

@Controller('/activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get('/')
  list(
    @Req() request: AuthenticatedRequest,
    @Query({
      schema: activityListQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: ActivityListQuery,
  ) {
    return this.activities.list(request.authSession.user, query);
  }

  @Public()
  @Get('/landing')
  landing(
    @Query({
      schema: landingQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: LandingQuery,
  ) {
    return this.activities.listForLanding(query);
  }

  @StudentCouncilOnly()
  @Get('/draft')
  getDraft(@Req() request: AuthenticatedRequest) {
    return this.activities.getDraft(request.authSession.user);
  }

  @StudentCouncilOnly()
  @Put('/draft')
  saveDraft(
    @Req() request: AuthenticatedRequest,
    @Body({
      schema: activityDraftDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: ActivityDraftDto,
  ) {
    return this.activities.saveDraft(request.authSession.user, body);
  }

  @StudentCouncilOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/draft')
  async deleteDraft(@Req() request: AuthenticatedRequest): Promise<void> {
    await this.activities.deleteDraft(request.authSession.user);
  }

  @Get('/:id')
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.activities.get(request.authSession.user, id);
  }

  @StudentCouncilOnly()
  @Post('/')
  async create(
    @Req() request: AuthenticatedRequest,
    @Body({
      schema: createActivityDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: CreateActivityDto,
  ) {
    const id = await this.activities.create(request.authSession.user, body);
    return this.activities.get(request.authSession.user, id);
  }

  @StudentCouncilOnly()
  @Patch('/:id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body({
      schema: updateActivityDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: UpdateActivityDto,
  ) {
    return this.activities.update(request.authSession.user, id, body);
  }

  @StudentCouncilOnly()
  @Patch('/:id/scope')
  setScope(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body({
      schema: activityScopeDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: ActivityScopeDto,
  ) {
    return this.activities.setScope(request.authSession.user, id, body.scope);
  }

  @StudentCouncilOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.activities.remove(id);
  }

  @StudentCouncilOnly()
  @Post('/:id/history')
  addHistory(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body({ schema: historyDtoSchema, pipes: [StandardSchemaValidationPipe] })
    body: HistoryDto,
  ) {
    return this.activities.addHistory(request.authSession.user, id, body);
  }

  @StudentCouncilOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id/history/:historyId')
  async deleteHistory(
    @Param('id', ParseIntPipe) id: number,
    @Param('historyId', ParseIntPipe) historyId: number,
  ): Promise<void> {
    await this.activities.deleteHistory(id, historyId);
  }
}
