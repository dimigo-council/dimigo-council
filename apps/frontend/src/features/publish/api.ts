import { setAgendaVisibility } from '../agendas/api.ts';
import { mockPublishItems } from './mockData.ts';
import type { PublishItem } from './types.ts';

/**
 * 공개 검토 API (업무공간).
 * TODO: 백엔드 공개 검토 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 지금은 메모리에만 저장하므로 새로고침하면 처음 상태로 돌아간다.
 */
export const isMockApi = true;

const items = structuredClone(mockPublishItems);

function find(id: string) {
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    throw new Response('공개 검토 글을 찾을 수 없습니다.', { status: 404 });
  }
  return item;
}

export async function listPublishItems(): Promise<PublishItem[]> {
  return structuredClone(items).sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt),
  );
}

/** 게시한다. 안건이면 안건 공개 범위도 전체 공개로 바꿔 학생 화면 학생회 활동에 나가게 한다. */
export async function publishItem(id: string, reviewer: string): Promise<void> {
  const item = find(id);
  if (item.kind === '안건' && item.agenda) {
    await setAgendaVisibility(item.agenda.id, '전체 공개');
  }
  item.status = '게시됨';
  item.reviewer = reviewer;
  item.decidedAt = new Date().toISOString();
}

export async function requestRevision(
  id: string,
  reviewer: string,
  note: string,
): Promise<void> {
  const item = find(id);
  item.status = '수정 요청';
  item.reviewer = reviewer;
  item.note = note.trim();
  item.decidedAt = new Date().toISOString();
}
