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
  Query,
  Req,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import {
  StudentCouncilOnly,
  type AuthenticatedRequest,
} from '#/auth/session.guard';
import {
  createTaskDtoSchema,
  taskListQuerySchema,
  taskLogDtoSchema,
  updateTaskDtoSchema,
  type CreateTaskDto,
  type TaskListQuery,
  type TaskLogDto,
  type UpdateTaskDto,
} from '../dto/tasks.dto.ts';
import { TasksService } from '../providers/tasks.service.ts';

/** 업무 is internal to the council (5.2). */
@StudentCouncilOnly()
@Controller('/tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get('/')
  list(
    @Req() request: AuthenticatedRequest,
    @Query({
      schema: taskListQuerySchema,
      pipes: [StandardSchemaValidationPipe],
    })
    query: TaskListQuery,
  ) {
    return this.tasks.list(request.authSession.user, query);
  }

  @Get('/:id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.tasks.get(id);
  }

  @Post('/')
  create(
    @Req() request: AuthenticatedRequest,
    @Body({
      schema: createTaskDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: CreateTaskDto,
  ) {
    return this.tasks.create(request.authSession.user, body);
  }

  @Patch('/:id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body({
      schema: updateTaskDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: UpdateTaskDto,
  ) {
    return this.tasks.update(request.authSession.user, id, body);
  }

  @Post('/:id/logs')
  addLog(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body({ schema: taskLogDtoSchema, pipes: [StandardSchemaValidationPipe] })
    body: TaskLogDto,
  ) {
    return this.tasks.addLog(request.authSession.user, id, body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tasks.remove(id);
  }
}
