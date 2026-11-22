import { useSyncExternalStore } from 'react';
import { redirect } from 'react-router';
import {
  api,
  getAccessToken,
  onAccessTokenChange,
  refreshAccessToken,
  setAccessToken,
  type Page,
  type TokenResponse,
} from '../lib/api.ts';

/** 권한 비트 (백엔드 users.permissions) */
export const Permission = {
  isAdmin: 1,
  isTeacher: 2,
  isStudentCouncil: 4,
} as const;

/** 액세스 토큰에 담긴 사용자 */
export interface AuthUser {
  id: string;
  email: string;
  permissions: number;
  name: string | null;
  pictureUrl: string | null;
  grade: number | null;
  class: number | null;
  gender: string | null;
  onboardingCompletedAt: string | null;
  createdAt: string;
}

/** 로그인한 사용자. 화면은 이 모양만 쓴다. */
export interface Session {
  id: string;
  email: string;
  name: string;
  grade: number | null;
  classNumber: number | null;
  /** 학생 화면 오른쪽 위에 보이는 소속 (예: 2학년 5반) */
  affiliation: string;
  /** 회원가입 정보 입력을 마쳤는지 */
  onboarded: boolean;
  isCouncil: boolean;
  isAdmin: boolean;
  /** 학생회 화면 오른쪽 위에 보이는 직책 (예: IT부 부장). 학생회 임원만 있다. */
  councilRole?: string;
  /** 학생회 소속 부서 */
  department?: string;
}

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(json, (char) => char.charCodeAt(0));
    const data: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (data && typeof data === 'object' && 'user' in data) {
      return data.user as AuthUser;
    }
  } catch {
    // 토큰을 읽지 못하면 로그인하지 않은 것으로 본다.
  }
  return null;
}

function affiliationOf(user: AuthUser) {
  if (user.grade == null) return user.email;
  return user.class == null
    ? `${user.grade}학년`
    : `${user.grade}학년 ${user.class}반`;
}

function sessionOf(user: AuthUser, previous: Session | null): Session {
  const isCouncil = (user.permissions & Permission.isStudentCouncil) !== 0;
  const same = previous?.id === user.id;
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? user.email.split('@')[0],
    grade: user.grade,
    classNumber: user.class,
    affiliation: affiliationOf(user),
    onboarded: Boolean(user.onboardingCompletedAt),
    isCouncil,
    isAdmin: (user.permissions & Permission.isAdmin) !== 0,
    ...(isCouncil && {
      councilRole: (same && previous.councilRole) || '학생회',
      ...(same && previous.department && { department: previous.department }),
    }),
  };
}

let current: Session | null = null;
const listeners = new Set<() => void>();
const endListeners = new Set<() => void>();

function publish(next: Session | null) {
  const ended = current !== null && next === null;
  current = next;
  for (const listener of listeners) listener();
  if (ended) for (const listener of endListeners) listener();
}

onAccessTokenChange((token) => {
  const user = token ? decodeToken(token) : null;
  publish(user ? sessionOf(user, current) : null);
});

interface MemberRow {
  id: string;
  department: { id: number; name: string } | null;
  role: 'member' | 'head' | null;
  position: string | null;
}

/** 학생회 임원이면 소속 부서와 직책을 구성원 목록에서 찾아 붙인다. */
async function loadCouncilProfile() {
  const session = current;
  if (!session?.isCouncil || !session.onboarded) return;
  try {
    for (let page = 1; ; page += 1) {
      const result = await api<Page<MemberRow>>('/members', {
        query: { page, pageSize: 100 },
      });
      const me = result.items.find((member) => member.id === session.id);
      if (me) {
        const position =
          me.position ??
          (me.role === 'head' ? '부장' : me.department && '부원');
        if (current?.id === session.id) {
          publish({
            ...current,
            department: me.department?.name,
            councilRole:
              [me.department?.name, position].filter(Boolean).join(' ') ||
              '학생회',
          });
        }
        return;
      }
      if (page * 100 >= result.total) return;
    }
  } catch {
    // 직책은 표시용이라 못 받아도 그대로 쓴다.
  }
}

/** 토큰을 받은 뒤 (로그인, 가입, 앱 시작) */
export async function startSession(tokens: Pick<TokenResponse, 'accessToken'>) {
  setAccessToken(tokens.accessToken);
  await loadCouncilProfile();
  return current;
}

/** 앱을 열 때 리프레시 쿠키로 로그인 상태를 되살린다. */
export async function restoreSession() {
  const token = await refreshAccessToken();
  if (token) await loadCouncilProfile();
  return current;
}

export async function logout() {
  if (getAccessToken()) {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // 서버 세션이 이미 없어도 화면에서는 로그아웃한다.
    }
  }
  setAccessToken(null);
}

/** 세션이 예기치 않게 끝났을 때 (리프레시 실패 등) */
export function onSessionEnd(listener: () => void) {
  endListeners.add(listener);
  return () => {
    endListeners.delete(listener);
  };
}

export function currentSession(): Session | null {
  return current;
}

/**
 * 로더처럼 컴포넌트 밖에서 쓸 때. 로그인하지 않았으면 로그인 화면으로 보낸다.
 * 로그인이 필요한 화면의 가드가 먼저 막으므로 보통은 세션이 있다.
 */
export function getSession(): Session {
  if (!current) throw redirect('/login');
  return current;
}

const emptySession: Session = {
  id: '',
  email: '',
  name: '',
  grade: null,
  classNumber: null,
  affiliation: '',
  onboarded: false,
  isCouncil: false,
  isAdmin: false,
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useOptionalSession(): Session | null {
  return useSyncExternalStore(subscribe, () => current);
}

/** 로그인이 필요한 화면 안에서. 로그아웃하는 순간에는 빈 세션을 돌려준다. */
export function useSession(): Session {
  return useOptionalSession() ?? emptySession;
}

/* 라우트 가드 */

/** 학생 화면: 로그인하고 회원가입 정보까지 입력해야 한다. */
export function requireMember({ request }: { request: Request }) {
  const session = current;
  if (!session) {
    const { pathname } = new URL(request.url);
    return redirect(pathname === '/' ? '/landing' : '/login');
  }
  if (!session.onboarded) return redirect('/signup/info');
  return null;
}

/** 학생회 화면(/work): 학생회 임원만 */
export function requireCouncil({ request }: { request: Request }) {
  const blocked = requireMember({ request });
  if (blocked) return blocked;
  return current?.isCouncil ? null : redirect('/');
}

/** 로그인·회원가입 첫 화면: 이미 로그인했으면 홈으로 */
export function redirectSignedIn() {
  if (!current) return null;
  return redirect(current.onboarded ? '/' : '/signup/info');
}

/** 회원가입 정보 입력: 가입 인증을 마치고 정보 입력이 남은 사람만 */
export function requirePending() {
  if (!current) return redirect('/signup');
  return current.onboarded ? redirect('/') : null;
}
