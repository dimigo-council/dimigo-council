import { z } from 'zod';
import { paginationQuerySchema, queryBoolean } from '#/common/pagination';
import {
  activityHistoryKinds,
  activityScopes,
  activityStatuses,
} from '#/db/schema/index';

const title = z.string().trim().min(1).max(200);
const description = z.string().trim().max(5000);
const shortText = z.string().trim().max(2000);

/** A path inside the app (`/records/r3`) or an http(s) URL. */
export const linkUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      (value.startsWith('/') && !value.startsWith('//')) ||
      /^https?:\/\//i.test(value),
    { message: 'Link must be an app path or an http(s) URL' },
  );

export const activityPlanSchema = z.object({
  author: z.string().trim().max(80),
  writtenAt: z.string().trim().max(40),
  period: z.string().trim().max(200),
  steps: z
    .array(z.object({ title: z.string().trim().max(200), body: shortText }))
    .max(30),
  cooperation: shortText,
  staff: z
    .array(
      z.object({
        role: z.string().trim().max(80),
        name: z.string().trim().max(80),
      }),
    )
    .max(50),
  cost: shortText,
  concerns: shortText,
});

export const activityListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(activityStatuses).optional(),
  scope: z.enum(activityScopes).optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  /** LND-03, HOM-02: home and landing lists leave out 보류 activities. */
  hideOnHold: queryBoolean.optional(),
  search: z.string().trim().min(1).max(80).optional(),
});
export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;

export const landingQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['검토 중', '추진 중', '완료']).optional(),
});
export type LandingQuery = z.infer<typeof landingQuerySchema>;

export const createActivityDtoSchema = z.object({
  title,
  description: description.default(''),
  scope: z.enum(activityScopes),
  status: z.enum(activityStatuses).default('검토 중'),
  departmentId: z.number().int().positive().nullable().optional(),
  /** 담당자. Defaults to the creator. */
  ownerId: z.uuid().nullable().optional(),
  /** 첫 추진 기록 */
  firstRecord: z.string().trim().max(200).optional(),
  inquiryIds: z.array(z.number().int().positive()).max(50).default([]),
  plan: activityPlanSchema.nullable().optional(),
});
export type CreateActivityDto = z.infer<typeof createActivityDtoSchema>;

export const updateActivityDtoSchema = z
  .object({
    title,
    description,
    status: z.enum(activityStatuses),
    departmentId: z.number().int().positive().nullable(),
    ownerId: z.uuid().nullable(),
    plan: activityPlanSchema.nullable(),
  })
  .partial();
export type UpdateActivityDto = z.infer<typeof updateActivityDtoSchema>;

export const activityScopeDtoSchema = z.object({
  scope: z.enum(activityScopes),
});
export type ActivityScopeDto = z.infer<typeof activityScopeDtoSchema>;

export const historyDtoSchema = z.object({
  kind: z.enum(activityHistoryKinds),
  title,
  body: shortText.optional(),
  /** Leave out for a planned entry. */
  at: z.iso.datetime({ offset: true }).nullable().optional(),
  link: z
    .object({ label: z.string().trim().min(1).max(40), url: linkUrl })
    .optional(),
});
export type HistoryDto = z.infer<typeof historyDtoSchema>;

/** 임시 저장 (AGD-C2): any partial form state, kept small. */
export const activityDraftDtoSchema = z
  .record(z.string().max(40), z.unknown())
  .refine((value) => JSON.stringify(value).length <= 20_000, {
    message: 'Draft is too large',
  });
export type ActivityDraftDto = z.infer<typeof activityDraftDtoSchema>;
