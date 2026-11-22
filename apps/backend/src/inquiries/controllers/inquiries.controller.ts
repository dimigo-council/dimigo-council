import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ParseRowIdPipe } from '#/common/ids';
import {
  StudentCouncilOnly,
  type AuthenticatedRequest,
} from '#/auth/session.guard';
import {
  activityFromInquiryDtoSchema,
  answerInquiryDtoSchema,
  createInquiryDtoSchema,
  inquiryDepartmentDtoSchema,
  inquiryListQuerySchema,
  inquiryScopeDtoSchema,
  linkActivityDtoSchema,
  type ActivityFromInquiryDto,
  type AnswerInquiryDto,
  type CreateInquiryDto,
  type InquiryDepartmentDto,
  type InquiryListQuery,
  type InquiryScopeDto,
  type LinkActivityDto,
} from '../dto/inquiries.dto.ts';
import { InquiriesService } from '../providers/inquiries.service.ts';

@Controller('/inquiries')
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Get('/')
  list(
    @Req() request: AuthenticatedRequest,
    @Query({
      schema: inquiryListQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: InquiryListQuery,
  ) {
    return this.inquiries.list(request.authSession.user, query);
  }

  @Get('/:id')
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseRowIdPipe) id: number,
  ) {
    return this.inquiries.get(request.authSession.user, id);
  }

  @Post('/')
  create(
    @Req() request: AuthenticatedRequest,
    @Body({
      schema: createInquiryDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: CreateInquiryDto,
  ) {
    return this.inquiries.create(request.authSession.user, body);
  }

  /** Author only. */
  @Patch('/:id/scope')
  setScope(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseRowIdPipe) id: number,
    @Body({
      schema: inquiryScopeDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: InquiryScopeDto,
  ) {
    return this.inquiries.setScope(request.authSession.user, id, body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/:id/like')
  toggleLike(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseRowIdPipe) id: number,
  ) {
    return this.inquiries.toggleLike(request.authSession.user, id);
  }

  @StudentCouncilOnly()
  @Patch('/:id/department')
  setDepartment(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseRowIdPipe) id: number,
    @Body({
      schema: inquiryDepartmentDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: InquiryDepartmentDto,
  ) {
    return this.inquiries.setDepartment(
      request.authSession.user,
      id,
      body.departmentId,
    );
  }

  @StudentCouncilOnly()
  @HttpCode(HttpStatus.OK)
  @Post('/:id/answer')
  answer(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseRowIdPipe) id: number,
    @Body({
      schema: answerInquiryDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: AnswerInquiryDto,
  ) {
    return this.inquiries.answer(request.authSession.user, id, body);
  }

  @StudentCouncilOnly()
  @Put('/:id/activity')
  linkActivity(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseRowIdPipe) id: number,
    @Body({
      schema: linkActivityDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: LinkActivityDto,
  ) {
    return this.inquiries.linkActivity(
      request.authSession.user,
      id,
      body.activityId,
    );
  }

  @StudentCouncilOnly()
  @Post('/:id/activity')
  createActivity(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseRowIdPipe) id: number,
    @Body({
      schema: activityFromInquiryDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: ActivityFromInquiryDto,
  ) {
    return this.inquiries.createActivity(request.authSession.user, id, body);
  }

  @StudentCouncilOnly()
  @Delete('/:id/activity')
  unlinkActivity(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseRowIdPipe) id: number,
  ) {
    return this.inquiries.unlinkActivity(request.authSession.user, id);
  }
}
