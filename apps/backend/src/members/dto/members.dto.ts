import { z } from 'zod';
import { queryRowId, rowId } from '#/common/ids';
import { departmentRoles } from '#/db/schema/index';
import { paginationQuerySchema, queryBoolean } from '#/common/pagination';

export const departmentDtoSchema = z.object({
  name: z.string().trim().min(1).max(40),
});
export type DepartmentDto = z.infer<typeof departmentDtoSchema>;

export const memberListQuerySchema = paginationQuerySchema.extend({
  departmentId: queryRowId.optional(),
});
export type MemberListQuery = z.infer<typeof memberListQuerySchema>;

export const userListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(80).optional(),
  /** true: council members only, false: everyone else. */
  council: queryBoolean.optional(),
});
export type UserListQuery = z.infer<typeof userListQuerySchema>;

export const membershipDtoSchema = z.object({
  departmentId: rowId,
  role: z.enum(departmentRoles).default('member'),
  position: z.string().trim().min(1).max(40).nullable().optional(),
});
export type MembershipDto = z.infer<typeof membershipDtoSchema>;

export const councilDtoSchema = z.object({
  isStudentCouncil: z.boolean(),
});
export type CouncilDto = z.infer<typeof councilDtoSchema>;
