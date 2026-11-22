import { z } from 'zod';
import { queryRowId, rowId } from '#/common/ids';
import { paginationQuerySchema, queryBoolean } from '#/common/pagination';
import { taskStatuses } from '#/db/schema/index';

const title = z.string().trim().min(1).max(200);
const tag = z.string().trim().min(1).max(20);

export const taskListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(taskStatuses).optional(),
  activityId: queryRowId.optional(),
  departmentId: queryRowId.optional(),
  /** HOM-09 나의 업무: tasks assigned to the viewer. */
  mine: queryBoolean.optional(),
});
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;

export const createTaskDtoSchema = z.object({
  title,
  tag: tag.nullable().optional(),
  activityId: rowId.nullable().optional(),
  departmentId: rowId.nullable().optional(),
  /** 담당자. Defaults to the assigner. */
  assigneeId: z.uuid().nullable().optional(),
  /** Defaults to today in Seoul (TSK-C1). */
  startAt: z.iso.date().optional(),
  dueAt: z.iso.date(),
  status: z.enum(taskStatuses).default('예정됨'),
});
export type CreateTaskDto = z.infer<typeof createTaskDtoSchema>;

export const updateTaskDtoSchema = z
  .object({
    title,
    tag: tag.nullable(),
    activityId: rowId.nullable(),
    departmentId: rowId.nullable(),
    assigneeId: z.uuid().nullable(),
    startAt: z.iso.date(),
    dueAt: z.iso.date(),
  })
  .partial();
export type UpdateTaskDto = z.infer<typeof updateTaskDtoSchema>;

export const taskLogDtoSchema = z.object({
  text: z.string().trim().min(1).max(200),
  /** 상태를 바꾼 기록이면 바뀐 뒤 상태 */
  status: z.enum(taskStatuses).optional(),
});
export type TaskLogDto = z.infer<typeof taskLogDtoSchema>;
