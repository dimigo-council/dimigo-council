import { z } from 'zod';
import { paginationQuerySchema } from '#/common/pagination';

const questionBase = {
  id: z.string().trim().min(1).max(40),
  title: z.string().trim().max(300),
  required: z.boolean().default(true),
};
const options = z.array(z.string().trim().max(200)).max(30);

/**
 * 문항. Drafts may hold blank titles and options; publishing checks them
 * (see publishProblems in surveys.policy.ts).
 */
export const surveyQuestionSchema = z.discriminatedUnion('type', [
  z.object({ ...questionBase, type: z.literal('single'), options }),
  z.object({
    ...questionBase,
    type: z.literal('multiple'),
    options,
    maxSelections: z.number().int().min(1).max(30).optional(),
  }),
  z.object({
    ...questionBase,
    type: z.literal('short'),
    maxLength: z.number().int().min(1).max(200).default(100),
    placeholder: z.string().trim().max(200).optional(),
  }),
  z.object({
    ...questionBase,
    type: z.literal('long'),
    maxLength: z.number().int().min(1).max(5000).default(1000),
    placeholder: z.string().trim().max(200).optional(),
  }),
]);

const grade = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const surveyDraftDtoSchema = z
  .object({
    title: z.string().trim().max(200),
    intro: z.string().trim().max(3000),
    activityId: z.number().int().positive().nullable(),
    departmentId: z.number().int().positive().nullable(),
    /** 응답 학년 */
    grades: z
      .array(grade)
      .min(1)
      .max(3)
      .refine((value) => new Set(value).size === value.length, {
        message: 'Grades must be unique',
      }),
    /** 학년/반 수집 여부 */
    collectsClass: z.boolean(),
    opensAt: z.iso.datetime({ offset: true }).nullable(),
    closesAt: z.iso.datetime({ offset: true }).nullable(),
    questions: z
      .array(surveyQuestionSchema)
      .max(50)
      .refine(
        (value) => new Set(value.map((item) => item.id)).size === value.length,
        { message: 'Question ids must be unique' },
      ),
  })
  .partial();
export type SurveyDraftDto = z.infer<typeof surveyDraftDtoSchema>;

export const surveyStatusFilters = [
  '작성 중',
  '예정',
  '진행 중',
  '마감',
] as const;

export const surveyListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(surveyStatusFilters).optional(),
});
export type SurveyListQuery = z.infer<typeof surveyListQuerySchema>;

export const surveyResponseDtoSchema = z.object({
  answers: z.record(
    z.string().max(40),
    z.union([z.string().max(5000), z.array(z.string().max(200)).max(30)]),
  ),
  /** 설문을 열고 제출하기까지 걸린 시간 */
  durationSeconds: z.number().int().min(0).max(86_400).optional(),
});
export type SurveyResponseDto = z.infer<typeof surveyResponseDtoSchema>;

export const acceptingDtoSchema = z.object({ accepting: z.boolean() });
export type AcceptingDto = z.infer<typeof acceptingDtoSchema>;

export const excludedDtoSchema = z.object({ excluded: z.boolean() });
export type ExcludedDto = z.infer<typeof excludedDtoSchema>;
