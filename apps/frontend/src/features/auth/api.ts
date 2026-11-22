/**
 * 로그인·회원가입 API.
 * TODO: 백엔드 인증 API가 생기면 함수 본문만 fetch 호출로 바꾼다. 지금은 어떤 6자리 코드든 통과한다.
 */
export const isMockApi = true;

/** 인증 코드를 다시 받을 수 있을 때까지 (초) */
export const RESEND_SECONDS = 60;

const SCHOOL_DOMAIN = '@dimigo.hs.kr';

export function isSchoolEmail(email: string) {
  const at = email.indexOf('@');
  return at > 0 && email.toLowerCase().endsWith(SCHOOL_DOMAIN);
}

export async function requestCode(email: string): Promise<void> {
  void email;
}

export async function verifyCode(email: string, code: string) {
  void email;
  return /^\d{6}$/.test(code);
}

export interface SignupInput {
  nickname: string;
  /** 학년·반·성별은 고를 때만 보낸다. 학년·반이 있어야 학년·반을 수집하는 설문에 응답할 수 있다. */
  grade?: number;
  classNumber?: number;
  gender?: '남성' | '여성';
}

export async function signup(input: SignupInput): Promise<void> {
  void input;
}
