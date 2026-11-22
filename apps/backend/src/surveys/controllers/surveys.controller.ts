import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import {
  StudentCouncilOnly,
  type AuthenticatedRequest,
} from '#/auth/session.guard';
import {
  paginationQuerySchema,
  type PaginationQuery,
} from '#/common/pagination';
import {
  acceptingDtoSchema,
  excludedDtoSchema,
  surveyDraftDtoSchema,
  surveyListQuerySchema,
  surveyResponseDtoSchema,
  type AcceptingDto,
  type ExcludedDto,
  type SurveyDraftDto,
  type SurveyListQuery,
  type SurveyResponseDto,
} from '../dto/surveys.dto.ts';
import { SurveysService } from '../providers/surveys.service.ts';

@Controller('/surveys')
export class SurveysController {
  constructor(private readonly surveys: SurveysService) {}

  @Get('/')
  list(
    @Req() request: AuthenticatedRequest,
    @Query({
      schema: surveyListQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: SurveyListQuery,
  ) {
    return this.surveys.list(request.authSession.user, query);
  }

  @StudentCouncilOnly()
  @Get('/drafts/latest')
  latestDraft(@Req() request: AuthenticatedRequest) {
    return this.surveys.latestDraft(request.authSession.user);
  }

  @Get('/:id')
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.surveys.get(request.authSession.user, id);
  }

  @StudentCouncilOnly()
  @Post('/')
  create(
    @Req() request: AuthenticatedRequest,
    @Body({
      schema: surveyDraftDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: SurveyDraftDto,
  ) {
    return this.surveys.create(request.authSession.user, body);
  }

  @StudentCouncilOnly()
  @Patch('/:id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body({
      schema: surveyDraftDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: SurveyDraftDto,
  ) {
    return this.surveys.update(request.authSession.user, id, body);
  }

  @StudentCouncilOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.surveys.remove(id);
  }

  @StudentCouncilOnly()
  @HttpCode(HttpStatus.OK)
  @Post('/:id/review-request')
  requestReview(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.surveys.requestReview(request.authSession.user, id);
  }

  @StudentCouncilOnly()
  @HttpCode(HttpStatus.OK)
  @Post('/:id/publish')
  publish(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.surveys.publish(request.authSession.user, id);
  }

  @StudentCouncilOnly()
  @HttpCode(HttpStatus.OK)
  @Post('/:id/unpublish')
  unpublish(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.surveys.unpublish(request.authSession.user, id);
  }

  @StudentCouncilOnly()
  @Patch('/:id/accepting')
  setAccepting(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body({ schema: acceptingDtoSchema, pipes: [StandardSchemaValidationPipe] })
    body: AcceptingDto,
  ) {
    return this.surveys.setAccepting(
      request.authSession.user,
      id,
      body.accepting,
    );
  }

  /** Students and council members respond the same way (SRV-C3). */
  @Post('/:id/responses')
  respond(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body({
      schema: surveyResponseDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: SurveyResponseDto,
  ) {
    return this.surveys.respond(request.authSession.user, id, body);
  }

  @StudentCouncilOnly()
  @Get('/:id/results')
  results(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.surveys.results(request.authSession.user, id);
  }

  @StudentCouncilOnly()
  @Get('/:id/responses')
  listResponses(
    @Param('id', ParseIntPipe) id: number,
    @Query({
      schema: paginationQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: PaginationQuery,
  ) {
    return this.surveys.listResponses(id, query);
  }

  @StudentCouncilOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:id/responses/:responseId')
  async setExcluded(
    @Param('id', ParseIntPipe) id: number,
    @Param('responseId', ParseUUIDPipe) responseId: string,
    @Body({ schema: excludedDtoSchema, pipes: [StandardSchemaValidationPipe] })
    body: ExcludedDto,
  ): Promise<void> {
    await this.surveys.setExcluded(id, responseId, body.excluded);
  }

  @StudentCouncilOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id/responses/:responseId')
  async deleteResponse(
    @Param('id', ParseIntPipe) id: number,
    @Param('responseId', ParseUUIDPipe) responseId: string,
  ): Promise<void> {
    await this.surveys.deleteResponse(id, responseId);
  }
}
