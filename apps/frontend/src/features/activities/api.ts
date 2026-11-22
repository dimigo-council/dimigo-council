import { api, listAll, notFoundAs, type Page } from '../../lib/api.ts';
import { departmentIdOf } from '../members/api.ts';
import type { DepartmentRef } from '../members/types.ts';
import type {
  Activity,
  ActivityDraft,
  ActivityHistory,
  ActivityPlan,
  ActivityScope,
  ActivityStatus,
  HistoryKind,
  NewActivityInput,
  NewHistoryInput,
} from './types.ts';

/**
 * 활동 API (백엔드 /activities). 공개 범위 거르기는 서버가 한다:
 * 학생에게는 전체 공개 활동만 오고, 학생회 활동은 404다.
 */

interface PersonRef {
  id: string;
  name: string | null;
}

interface ActivitySummaryResponse {
  id: number;
  title: string;
  description: string;
  status: ActivityStatus;
  scope: ActivityScope;
  department: DepartmentRef | null;
  owner: PersonRef | null;
  registeredAt: string;
  inquiryIds: number[];
  surveyIds: number[];
}

interface HistoryResponse {
  id: number;
  kind: HistoryKind;
  at: string | null;
  title: string;
  body: string | null;
  link: { label: string; url: string } | null;
  taskId: number | null;
}

interface ActivityDetailResponse extends ActivitySummaryResponse {
  plan: ActivityPlan | null;
  history: HistoryResponse[];
  inquiries: { id: number; title: string; status: string }[];
  surveys: { id: number; title: string; closesAt: string | null }[];
  tasks: { id: number; title: string; status: string; dueAt: string }[];
  canChangeScope: boolean;
}

const notFound = notFoundAs('활동을 찾을 수 없습니다.');

/** 화면의 번호 문자열 → 서버 id */
export function numericId(id: string) {
  const value = Number(id);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Response('찾을 수 없는 번호입니다.', { status: 404 });
  }
  return value;
}

function toHistory(item: HistoryResponse): ActivityHistory {
  return {
    id: String(item.id),
    kind: item.kind,
    ...(item.at && { at: item.at }),
    title: item.title,
    ...(item.body && { body: item.body }),
    ...(item.link && { link: { label: item.link.label, to: item.link.url } }),
  };
}

function toActivity(
  row: ActivitySummaryResponse | ActivityDetailResponse,
): Activity {
  const detail = 'history' in row ? row : null;
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    status: row.status,
    scope: row.scope,
    department: row.department?.name ?? '',
    owner: row.owner?.name ?? '',
    ...(row.owner && { ownerId: row.owner.id }),
    registeredAt: row.registeredAt,
    inquiryIds: row.inquiryIds.map(String),
    surveyIds: row.surveyIds.map(String),
    history: detail ? detail.history.map(toHistory) : [],
    ...(detail?.plan && { plan: detail.plan }),
    ...(detail && { canChangeScope: detail.canChangeScope }),
  };
}

export interface ActivityQuery {
  status?: ActivityStatus;
  /** 홈 목록: 보류 활동을 뺀다 (HOM-02) */
  hideOnHold?: boolean;
}

/** 학생회 화면: 모든 활동 (최근 등록순) */
export async function listActivities(query: ActivityQuery = {}) {
  return (
    await listAll<ActivitySummaryResponse>('/activities', { ...query })
  ).map(toActivity);
}

/** 학생 화면: 전체 공개 활동만. 학생회 임원이 학생 화면을 볼 때도 전체 공개만 보인다. */
export async function listPublicActivities(query: ActivityQuery = {}) {
  return (
    await listAll<ActivitySummaryResponse>('/activities', {
      ...query,
      scope: '전체 공개',
    })
  ).map(toActivity);
}

/** 랜딩 (로그인 전): 보류를 뺀 전체 공개 활동. 담당자 이름은 오지 않는다. */
export async function listLandingActivities(limit = 100) {
  const page = await api<Page<ActivitySummaryResponse>>('/activities/landing', {
    query: { pageSize: limit },
    auth: false,
  });
  return page.items.map(toActivity);
}

export interface ActivityDetail {
  activity: Activity;
  /** 볼 수 있는 연결 질의 */
  inquiries: { id: string; title: string; status: string }[];
  /** 볼 수 있는 연결 설문 */
  surveyIds: string[];
}

export async function getActivity(id: string): Promise<Activity> {
  return (await getActivityDetail(id)).activity;
}

export async function getActivityDetail(id: string): Promise<ActivityDetail> {
  const row = await api<ActivityDetailResponse>(
    `/activities/${numericId(id)}`,
  ).catch(notFound);
  return {
    activity: toActivity(row),
    inquiries: row.inquiries.map((item) => ({ ...item, id: String(item.id) })),
    surveyIds: row.surveys.map((item) => String(item.id)),
  };
}

/** 학생 화면: 학생회 공개 범위인 활동은 없는 것으로 본다. */
export async function getPublicActivityDetail(id: string) {
  const detail = await getActivityDetail(id);
  if (detail.activity.scope !== '전체 공개') {
    throw new Response('활동을 찾을 수 없습니다.', { status: 404 });
  }
  return detail;
}

export async function createActivity(input: NewActivityInput): Promise<string> {
  const created = await api<ActivityDetailResponse>('/activities', {
    method: 'POST',
    body: {
      title: input.title.trim(),
      description: input.description.trim(),
      scope: input.scope,
      status: '검토 중',
      departmentId: await departmentIdOf(input.department),
      ...(input.ownerId && { ownerId: input.ownerId }),
      ...(input.firstRecord.trim() && {
        firstRecord: input.firstRecord.trim(),
      }),
      // 서버가 질의를 연결하고 추진 이력에 질의 기록을 남긴다.
      inquiryIds: input.inquiryIds.map(Number),
    },
  });
  return String(created.id);
}

/** 임시 저장한 활동 등록 내용 (등록하면 서버가 지운다) */
export async function getActivityDraft(): Promise<ActivityDraft | null> {
  const draft = await api<{ data: ActivityDraft; savedAt: string } | null>(
    '/activities/draft',
  );
  return draft?.data ?? null;
}

export async function saveActivityDraft(input: ActivityDraft): Promise<void> {
  await api('/activities/draft', { method: 'PUT', body: input });
}

/** 이력 추가. 날짜 순서는 서버가 맞춘다. */
export async function addHistory(
  id: string,
  input: NewHistoryInput,
): Promise<void> {
  await api(`/activities/${numericId(id)}/history`, {
    method: 'POST',
    body: {
      kind: input.kind,
      title: input.title.trim(),
      ...(input.body?.trim() && { body: input.body.trim() }),
      at: input.at,
    },
  });
}

export async function deleteHistory(
  id: string,
  historyId: string,
): Promise<void> {
  await api(`/activities/${numericId(id)}/history/${numericId(historyId)}`, {
    method: 'DELETE',
  });
}

/** 공개 범위 변경. 담당자만 바꿀 수 있다 (서버가 확인한다). */
export async function setActivityScope(
  id: string,
  scope: ActivityScope,
): Promise<void> {
  await api(`/activities/${numericId(id)}/scope`, {
    method: 'PATCH',
    body: { scope },
  });
}

/** 질의를 이 활동에 연결한다. 서버가 추진 이력에 질의 기록을 남긴다. */
export async function linkInquiry(
  id: string,
  inquiry: { id: string },
): Promise<void> {
  await api(`/inquiries/${numericId(inquiry.id)}/activity`, {
    method: 'PUT',
    body: { activityId: numericId(id) },
  });
}
