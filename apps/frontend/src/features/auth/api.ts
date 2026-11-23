import { startSession } from '../../app/session.ts';
import { api, type TokenResponse } from '../../lib/api.ts';

/**
 * 로그인·회원가입 API (백엔드 /auth).
 * 이메일 코드: 코드 받기 → 코드 확인으로 토큰을 받는다. Google: 서버가 준 주소로 갔다가
 * /google/{signup,login}/callback으로 돌아와 code·state를 서버에 넘긴다.
 */

/** 인증 코드를 다시 받을 수 있을 때까지 (초) */
export const RESEND_SECONDS = 60;

const SCHOOL_DOMAIN = '@dimigo.hs.kr';

export type AuthFlow = 'login' | 'signup';

export function isSchoolEmail(email: string) {
  const at = email.indexOf('@');
  return at > 0 && email.toLowerCase().endsWith(SCHOOL_DOMAIN);
}

/**
 * 인증 코드 메일을 보낸다. 서버는 계정이 있는지와 재전송 대기 시간을 알려주지 않고 늘 같은 응답을 준다.
 */
export async function requestCode(flow: AuthFlow, email: string) {
  await api(`/auth/${flow}/email`, {
    method: 'POST',
    body: { email },
    auth: false,
  });
}

/** 코드를 확인하고 로그인한다. 돌려준 세션으로 다음 화면을 정한다. */
export async function verifyCode(flow: AuthFlow, email: string, code: string) {
  const tokens = await api<TokenResponse>(`/auth/${flow}/email/callback`, {
    method: 'POST',
    body: { email, code },
    auth: false,
  });
  return startSession(tokens);
}

/** Google 로그인 주소로 이동한다. 서버가 OAuth state 쿠키를 함께 심는다. */
export async function startGoogle(flow: AuthFlow) {
  const redirectUri = `${window.location.origin}/google/${flow}/callback`;
  const { url } = await api<{ url: string }>(`/auth/${flow}/google`, {
    query: { redirectUri },
    auth: false,
  });
  window.location.assign(url);
}

/** Google에서 돌아온 code·state·iss를 서버에 넘겨 로그인한다. */
export async function finishGoogle(
  flow: AuthFlow,
  params: { code: string; state: string; iss?: string },
) {
  const tokens = await api<TokenResponse>(`/auth/${flow}/google/callback`, {
    method: 'POST',
    body: params,
    auth: false,
  });
  return startSession(tokens);
}

export interface SignupInput {
  nickname: string;
  /** 학년·반·성별은 고를 때만 보낸다. 학년·반이 있어야 학년·반을 수집하는 설문에 응답할 수 있다. */
  grade?: number;
  classNumber?: number;
  gender?: '남성' | '여성';
}

/** 회원가입 정보 입력. 새 토큰(정보가 반영된)을 받아 세션을 바꾼다. */
export async function signup(input: SignupInput) {
  const result = await api<TokenResponse>('/auth/signup/onboarding', {
    method: 'POST',
    body: {
      name: input.nickname,
      ...(input.grade !== undefined && { grade: input.grade }),
      ...(input.classNumber !== undefined && { class: input.classNumber }),
      ...(input.gender && { gender: input.gender }),
    },
  });
  return startSession(result);
}
