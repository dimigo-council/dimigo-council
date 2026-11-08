import { z } from 'zod';

export const emailDtoSchema = z.object({
  email: z.email(),
});
export type EmailDto = z.infer<typeof emailDtoSchema>;

export const emailCodeDtoSchema = emailDtoSchema.extend({
  code: z.string().regex(/^\d{6}$/),
});
export type EmailCodeDto = z.infer<typeof emailCodeDtoSchema>;

export const googleCallbackDtoSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
  iss: z.string().min(1).optional(),
});
export type GoogleCallbackDto = z.infer<typeof googleCallbackDtoSchema>;

export const onboardingDtoSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    grade: z.number().int().min(1).max(3).optional(),
    class: z.number().int().min(1).max(6).optional(),
    pictureUrl: z.url().max(2048).optional(),
    gender: z.string().trim().min(1).max(40).optional(),
  })
  .refine((value) => value.class === undefined || value.grade !== undefined, {
    message: 'grade is required when class is provided',
    path: ['grade'],
  });
export type OnboardingDto = z.infer<typeof onboardingDtoSchema>;
