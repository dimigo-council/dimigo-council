/**
 * 백엔드 API 호출. 액세스 토큰은 메모리에만 두고, 401이면 리프레시 쿠키로 한 번 새로 받아 다시 보낸다.
 * API는 같은 출처의 /api 아래에 있다 (vite.config.ts의 프록시).
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(
  /\/$/,
  '',
);

/** 목록 API의 응답 (page는 1부터) */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 서버가 보낸 오류. message는 서버 메시지(배열이면 줄바꿈으로 이은 것)다. */
export class ApiError extends Error {
  readonly status: number;
  /** 서버가 보낸 메시지 목록 */
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages.join('\n') || `요청이 실패했습니다 (${status}).`);
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
  }
}

export interface TokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

let accessToken: string | null = null;
const tokenListeners = new Set<(token: string | null) => void>();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  for (const listener of tokenListeners) listener(token);
}

/** 토큰이 바뀔 때 (로그인, 리프레시, 로그아웃, 리프레시 실패) */
export function onAccessTokenChange(listener: (token: string | null) => void) {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Query;
  body?: unknown;
  /** false면 토큰 없이 보낸다 (로그인 전 API) */
  auth?: boolean;
  signal?: AbortSignal;
}

function urlOf(path: string, query?: Query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const search = params.toString();
  return `${BASE_URL}${path}${search ? `?${search}` : ''}`;
}

async function errorOf(response: Response) {
  let messages: string[] = [];
  try {
    const data: unknown = await response.json();
    if (data && typeof data === 'object' && 'message' in data) {
      const { message } = data;
      if (typeof message === 'string') messages = [message];
      else if (Array.isArray(message))
        messages = message.filter(
          (item): item is string => typeof item === 'string',
        );
    }
  } catch {
    // 본문이 JSON이 아니면 상태 코드만 남긴다.
  }
  return new ApiError(response.status, messages);
}

async function send(
  path: string,
  options: RequestOptions,
  token: string | null,
) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(urlOf(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: 'include',
    signal: options.signal,
  });
}

let refreshing: Promise<string | null> | null = null;

/**
 * 리프레시 쿠키로 새 액세스 토큰을 받는다. 동시에 여러 번 불려도 요청은 한 번만 보낸다.
 * 실패하면 로그아웃된 것으로 보고 null을 돌려준다.
 */
export function refreshAccessToken(): Promise<string | null> {
  refreshing ??= (async () => {
    try {
      const response = await send('/auth/refresh', { method: 'POST' }, null);
      if (!response.ok) {
        setAccessToken(null);
        return null;
      }
      const data = (await response.json()) as TokenResponse;
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 202) {
    return undefined as T;
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function api<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const auth = options.auth ?? true;
  if (auth && !accessToken) {
    // 로그인하지 않았으면 서버에 묻지 않는다. 라우트 가드가 로그인으로 보낸다.
    throw new ApiError(401, []);
  }
  let response = await send(path, options, auth ? accessToken : null);
  if (auth && response.status === 401) {
    const token = await refreshAccessToken();
    if (!token) throw await errorOf(response);
    response = await send(path, options, token);
  }
  if (!response.ok) throw await errorOf(response);
  return parse<T>(response);
}

/** 목록 API를 끝까지 넘겨 모두 받는다. 한 번에 100개씩. */
export async function listAll<T>(path: string, query: Query = {}) {
  const items: T[] = [];
  for (let page = 1; ; page += 1) {
    const result = await api<Page<T>>(path, {
      query: { ...query, page, pageSize: 100 },
    });
    items.push(...result.items);
    if (result.items.length === 0 || items.length >= result.total) break;
  }
  return items;
}

/**
 * 로더에서 쓰는 오류 변환. 404는 라우트 오류 화면의 "찾을 수 없는 화면"으로 보낸다.
 * 나머지는 그대로 던져 오류 화면이 서버 메시지를 보여준다.
 */
export function notFoundAs(message: string) {
  return (error: unknown): never => {
    if (error instanceof ApiError && error.status === 404) {
      throw new Response(message, { status: 404 });
    }
    throw error;
  };
}

/** 서버의 영어 메시지 가운데 화면에 그대로 보일 수 있는 것 */
const koreanMessages: Record<string, string> = {
  'Invalid or expired verification code':
    '코드가 맞지 않거나 만료됐어요. 다시 확인해 주세요.',
  'Email must use @dimigo.hs.kr': '@dimigo.hs.kr 계정만 사용할 수 있어요.',
  'Account already exists': '이미 가입한 계정이에요. 로그인해 주세요.',
  'Account is not registered':
    '가입하지 않은 계정이에요. 먼저 회원가입해 주세요.',
  'Invalid Google sign-in state':
    'Google 로그인 정보가 맞지 않아요. 처음부터 다시 시도해 주세요.',
  'Google sign-in expired':
    'Google 로그인 시간이 지났어요. 처음부터 다시 시도해 주세요.',
  'Invalid Google callback URL':
    'Google 로그인 주소가 맞지 않아요. 처음부터 다시 시도해 주세요.',
  'A verified school Google account is required':
    '인증된 @dimigo.hs.kr Google 계정만 사용할 수 있어요.',
  'Complete onboarding first': '회원가입 정보를 먼저 입력해 주세요.',
  'Onboarding is already complete': '이미 회원가입을 마쳤어요.',
  'Only the 담당자 can change the scope':
    '공개 범위는 담당자만 바꿀 수 있어요.',
  'You have already responded': '이미 응답한 설문이에요.',
  'Survey is not accepting responses': '지금은 응답을 받지 않는 설문이에요.',
  'This survey needs the grade and class from sign-up':
    '학년·반을 수집하는 설문이라 회원가입 때 학년·반을 입력한 학생만 응답할 수 있어요.',
  'This survey is for other grades': '응답 대상 학년이 아니에요.',
  'Published surveys cannot be edited': '게시한 설문은 고칠 수 없어요.',
  'Activity has published surveys; unlink them first':
    '게시된 설문이 연결된 활동은 지울 수 없어요.',
  'Write an answer first': '답변을 먼저 적어 주세요.',
  '반려 needs a reason': '반려 사유를 적어 주세요.',
  'The inquiry changed; reload and try again':
    '그사이 질의가 바뀌었어요. 새로고침한 뒤 다시 시도해 주세요.',
  '익명 is available only for 전체 공개 inquiries':
    '익명은 전체 공개 질의에서만 고를 수 있어요.',
  '담당자 must be a student council member': '담당자는 학생회 임원이어야 해요.',
  'User is not a student council member': '학생회 임원이 아니에요.',
  Forbidden: '권한이 없어요.',
  Unauthorized: '다시 로그인해 주세요.',
};

function translate(message: string) {
  if (koreanMessages[message]) return koreanMessages[message];
  const transition = /^Cannot change an inquiry from (.+) to (.+)$/.exec(
    message,
  );
  if (transition)
    return `${transition[1]} 상태의 질의는 ${transition[2]}(으)로 바꿀 수 없어요.`;
  return message;
}

/** 화면에 보여줄 오류 문구. 서버 메시지가 없으면 fallback. */
export function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status >= 500 || error.messages.length === 0) return fallback;
    return error.messages.map(translate).join('\n');
  }
  if (error instanceof TypeError) return '서버에 연결하지 못했습니다.';
  return error instanceof Error && error.message ? error.message : fallback;
}
