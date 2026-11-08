import { UnauthorizedException } from '@nestjs/common';
import { verifiedSchoolGoogleIdentity } from './school-identity.ts';

describe('school Google identity', () => {
  const claims = {
    sub: 'google-user-123',
    email: 'Student@dimigo.hs.kr',
    email_verified: true,
    hd: 'dimigo.hs.kr',
  };

  it('accepts a verified school Workspace account', () => {
    expect(verifiedSchoolGoogleIdentity(claims)).toEqual({
      email: 'student@dimigo.hs.kr',
      googleSub: 'google-user-123',
    });
  });

  it('rejects a personal Google account with a school-looking email', () => {
    expect(() =>
      verifiedSchoolGoogleIdentity({ ...claims, hd: undefined }),
    ).toThrow(UnauthorizedException);
    expect(() =>
      verifiedSchoolGoogleIdentity({ ...claims, email_verified: false }),
    ).toThrow(UnauthorizedException);
  });
});
