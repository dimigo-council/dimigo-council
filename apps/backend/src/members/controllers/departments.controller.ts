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
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ParseRowIdPipe } from '#/common/ids';
import { AdminOnly } from '#/auth/session.guard';
import { departmentDtoSchema, type DepartmentDto } from '../dto/members.dto.ts';
import { DepartmentsService } from '../providers/departments.service.ts';

@Controller('/departments')
export class DepartmentsController {
  constructor(private readonly departments: DepartmentsService) {}

  /** Department names are shown on public activities and inquiries, so every signed-in user can read them. */
  @Get('/')
  list() {
    return this.departments.list();
  }

  @AdminOnly()
  @Post('/')
  create(
    @Body({
      schema: departmentDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: DepartmentDto,
  ) {
    return this.departments.create(body.name);
  }

  @AdminOnly()
  @Patch('/:id')
  rename(
    @Param('id', ParseRowIdPipe) id: number,
    @Body({
      schema: departmentDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: DepartmentDto,
  ) {
    return this.departments.rename(id, body.name);
  }

  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  async remove(@Param('id', ParseRowIdPipe) id: number): Promise<void> {
    await this.departments.remove(id);
  }
}
