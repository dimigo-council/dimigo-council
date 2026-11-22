import { mockActivities } from './mockData.ts';
import type {
  Activity,
  ActivityDraft,
  ActivityScope,
  NewActivityInput,
  NewHistoryInput,
} from './types.ts';

/**
 * 활동 API.
 * TODO: 백엔드 활동 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 공개 범위 거르기(학생에게는 전체 공개 활동만)도 서버가 해야 한다.
 * 지금은 메모리에만 저장하므로 새로고침하면 처음 상태로 돌아간다.
 */
export const isMockApi = true;

const activities = structuredClone(mockActivities);
let draft: ActivityDraft | null = null;

function find(id: string) {
  const activity = activities.find((item) => item.id === id);
  if (!activity) {
    throw new Response('활동을 찾을 수 없습니다.', { status: 404 });
  }
  return activity;
}

const byNewest = (a: Activity, b: Activity) =>
  b.registeredAt.localeCompare(a.registeredAt) || Number(b.id) - Number(a.id);

/** 학생회 화면: 모든 활동 */
export async function listActivities(): Promise<Activity[]> {
  return structuredClone(activities).sort(byNewest);
}

/** 학생 화면: 전체 공개 활동만 */
export async function listPublicActivities(): Promise<Activity[]> {
  return (await listActivities()).filter(
    (activity) => activity.scope === '전체 공개',
  );
}

export async function getActivity(id: string): Promise<Activity> {
  return structuredClone(find(id));
}

/** 학생 화면: 학생회 공개 범위인 활동은 없는 것으로 본다. */
export async function getPublicActivity(id: string): Promise<Activity> {
  const activity = await getActivity(id);
  if (activity.scope !== '전체 공개') {
    throw new Response('활동을 찾을 수 없습니다.', { status: 404 });
  }
  return activity;
}

export async function createActivity(input: NewActivityInput): Promise<string> {
  const id = String(Math.max(...activities.map((item) => Number(item.id))) + 1);
  const now = new Date().toISOString();
  activities.push({
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    status: '검토 중',
    scope: input.scope,
    department: input.department,
    owner: input.owner,
    registeredAt: now,
    inquiryIds: input.inquiryIds,
    history: input.firstRecord.trim()
      ? [
          {
            id: 'h1',
            kind: input.inquiryIds.length > 0 ? '질의' : '추진',
            at: now,
            title: input.firstRecord.trim(),
          },
        ]
      : [],
  });
  draft = null;
  return id;
}

export async function getActivityDraft(): Promise<ActivityDraft | null> {
  return structuredClone(draft);
}

export async function saveActivityDraft(input: ActivityDraft): Promise<void> {
  draft = structuredClone(input);
}

/** 이력 추가. 날짜 순서에 맞춰 넣고, 예정된 이력은 맨 뒤에 둔다. */
export async function addHistory(
  id: string,
  input: NewHistoryInput,
): Promise<void> {
  const activity = find(id);
  const numbers = activity.history.map((item) => Number(item.id.slice(1)) || 0);
  activity.history.push({
    id: `h${Math.max(0, ...numbers) + 1}`,
    kind: input.kind,
    at: input.at,
    title: input.title.trim(),
    ...(input.body?.trim() && { body: input.body.trim() }),
  });
  activity.history.sort((a, b) =>
    !a.at ? 1 : !b.at ? -1 : a.at.localeCompare(b.at),
  );
}

export async function deleteHistory(
  id: string,
  historyId: string,
): Promise<void> {
  const activity = find(id);
  activity.history = activity.history.filter((item) => item.id !== historyId);
}

/** 공개 범위 변경. 담당자만 바꿀 수 있다. */
export async function setActivityScope(
  id: string,
  scope: ActivityScope,
  by: string,
): Promise<void> {
  const activity = find(id);
  if (activity.owner !== by) {
    throw new Error('공개 범위는 담당자만 바꿀 수 있습니다.');
  }
  activity.scope = scope;
}

/** 질의를 이 활동에 연결하고 추진 이력에 질의 기록을 남긴다. */
export async function linkInquiry(
  id: string,
  inquiry: { id: string; title: string },
): Promise<void> {
  const activity = find(id);
  if (activity.inquiryIds.includes(inquiry.id)) return;
  activity.inquiryIds.push(inquiry.id);
  await addHistory(id, {
    kind: '질의',
    at: new Date().toISOString(),
    title: `학생 질의 #${inquiry.id} 연결`,
    body: `‘${inquiry.title}’ 질의를 이 활동에 연결했어요.`,
  });
}
