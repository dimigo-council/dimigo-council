import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export const SCHOOL_DOMAIN = 'dimigo.hs.kr';

export function schoolEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@dimigo\.hs\.kr$/.test(normalized)) {
    throw new BadRequestException(`Email must use @${SCHOOL_DOMAIN}`);
  }
  return normalized;
}

export function verifiedSchoolGoogleIdentity(claims: unknown): {
  email: string;
  googleSub: string;
} {
  if (!claims || typeof claims !== 'object')
    throw new UnauthorizedException(
      'A verified school Google account is required',
    );
  const values = claims as Record<string, unknown>;
  if (
    typeof values.email !== 'string' ||
    values.email_verified !== true ||
    values.hd !== SCHOOL_DOMAIN ||
    typeof values.sub !== 'string' ||
    !values.sub
  ) {
    throw new UnauthorizedException(
      'A verified school Google account is required',
    );
  }
  try {
    return { email: schoolEmail(values.email), googleSub: values.sub };
  } catch {
    throw new UnauthorizedException(
      'A verified school Google account is required',
    );
  }
}
