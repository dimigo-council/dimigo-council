import { linkSuggestion } from '../agendas/api.ts';
import { mockInbox } from './mockData.ts';
import type { InboxSuggestion, ResolveInput } from './types.ts';

/**
 * 건의 접수함 API (업무공간). 학생이 보낸 모든 건의를 본다.
 * TODO: 백엔드 건의 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 지금은 학생 화면 "내 건의"(features/suggestions)와 데이터를 나누지 않고 따로 들고 있다.
 */
export const isMockApi = true;

const inbox = structuredClone(mockInbox);

export async function listInbox(): Promise<InboxSuggestion[]> {
  return structuredClone(inbox).sort((a, b) =>
    b.receivedAt.localeCompare(a.receivedAt),
  );
}

/** 접수 대기 건의를 맡아 검토 중으로 바꾼다. */
function find(id: string) {
  const suggestion = inbox.find((item) => item.id === id);
  if (!suggestion) {
    throw new Response('건의를 찾을 수 없습니다.', { status: 404 });
  }
  return suggestion;
}

export async function startReview(
  id: string,
  handler: string,
  department: string,
): Promise<void> {
  const suggestion = find(id);
  suggestion.status = '검토 중';
  suggestion.handler = handler;
  suggestion.department = department;
  suggestion.updatedAt = new Date().toISOString();
}

/** 검토 중인 건의를 답변·안건 채택·반려로 마무리한다. 안건 채택이면 안건의 건의 수도 늘린다. */
export async function resolveSuggestion(
  id: string,
  input: ResolveInput,
): Promise<void> {
  const suggestion = find(id);
  if (suggestion.status !== '검토 중') {
    throw new Error('검토 중인 건의만 처리할 수 있습니다.');
  }
  if (input.result === '안건 채택') {
    if (!input.agenda) throw new Error('묶을 안건을 골라주세요.');
    await linkSuggestion(input.agenda.id);
    suggestion.agenda = input.agenda;
  }
  suggestion.status = input.result;
  suggestion.answer = input.answer.trim();
  suggestion.handler = input.handler;
  suggestion.updatedAt = new Date().toISOString();
}
