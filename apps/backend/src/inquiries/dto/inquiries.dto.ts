import { z } from 'zod';
import { createActivityDtoSchema } from '#/activities/dto/activities.dto';
import { paginationQuerySchema, queryBoolean } from '#/common/pagination';
import { inquiryScopes, inquiryStatuses } from '#/db/schema/index';

const anonymousNeedsPublic = {
  message: '익명 is available only for 전체 공개 inquiries',
  path: ['anonymous'],
};

export const inquiryListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(inquiryStatuses).optional(),
  /** 내 질의만 보기 */
  mine: queryBoolean.optional(),
  departmentId: z.coerce.number().int().positive().optional(),
});
export type InquiryListQuery = z.infer<typeof inquiryListQuerySchema>;

/** SGT-C1 */
export const createInquiryDtoSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(1000),
    scope: z.enum(inquiryScopes),
    anonymous: z.boolean().default(false),
  })
  .refine(
    (value) => !value.anonymous || value.scope === '전체 공개',
    anonymousNeedsPublic,
  );
export type CreateInquiryDto = z.infer<typeof createInquiryDtoSchema>;

/** Only the author sets the 공개 범위 (2장). */
export const inquiryScopeDtoSchema = z
  .object({
    scope: z.enum(inquiryScopes),
    anonymous: z.boolean().default(false),
  })
  .refine(
    (value) => !value.anonymous || value.scope === '전체 공개',
    anonymousNeedsPublic,
  );
export type InquiryScopeDto = z.infer<typeof inquiryScopeDtoSchema>;

export const inquiryDepartmentDtoSchema = z.object({
  departmentId: z.number().int().positive().nullable(),
});
export type InquiryDepartmentDto = z.infer<typeof inquiryDepartmentDtoSchema>;

/**
 * SGT-U1 처리. `body` is the answer for 답변 완료 and 처리 완료, and the
 * reason for 반려.
 */
export const answerInquiryDtoSchema = z.object({
  status: z.enum(['답변 완료', '처리 완료', '반려']),
  body: z.string().trim().min(1).max(2000).optional(),
  departmentId: z.number().int().positive().optional(),
});
export type AnswerInquiryDto = z.infer<typeof answerInquiryDtoSchema>;

export const linkActivityDtoSchema = z.object({
  activityId: z.number().int().positive(),
});
export type LinkActivityDto = z.infer<typeof linkActivityDtoSchema>;

/** SGT-U2 제안을 활동으로 등록. Title and description default to the inquiry's. */
export const activityFromInquiryDtoSchema = createActivityDtoSchema
  .omit({ inquiryIds: true })
  .partial({ title: true, scope: true });
export type ActivityFromInquiryDto = z.infer<
  typeof activityFromInquiryDtoSchema
>;
