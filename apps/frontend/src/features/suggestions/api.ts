import { mockSuggestions } from './mockData.ts';
import type { NewSuggestionInput, Suggestion } from './types.ts';

/**
 * 건의 API.
 * TODO: 백엔드 건의 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 지금은 메모리에만 저장하므로 새로고침하면 처음 상태로 돌아간다. 사진은 파일 이름만 남긴다.
 */
export const isMockApi = true;

const suggestions = structuredClone(mockSuggestions);
let nextNumber = 403;

function find(id: string) {
  const suggestion = suggestions.find((item) => item.id === id);
  if (!suggestion) {
    throw new Response('건의를 찾을 수 없습니다.', { status: 404 });
  }
  return suggestion;
}

export async function listMySuggestions(): Promise<Suggestion[]> {
  return structuredClone(suggestions).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export async function getSuggestion(id: string): Promise<Suggestion> {
  return structuredClone(find(id));
}

export async function createSuggestion(
  input: NewSuggestionInput,
): Promise<string> {
  const now = new Date().toISOString();
  const id = `S-26-${String(nextNumber++).padStart(4, '0')}`;
  suggestions.push({
    id,
    category: input.category,
    title: input.title.trim(),
    identity: input.identity,
    status: '접수 대기',
    submittedAt: now,
    updatedAt: now,
    photos: input.photos,
    ...(input.aboutAgenda && { aboutAgenda: input.aboutAgenda }),
    messages: [
      {
        id: 'm1',
        from: 'me',
        original: true,
        at: now,
        body: input.body.trim(),
      },
    ],
    history: [{ status: '접수 대기', at: now }],
    notify: { status: true, agenda: true },
  });
  return id;
}

export async function addComment(id: string, body: string): Promise<void> {
  const suggestion = find(id);
  const now = new Date().toISOString();
  suggestion.messages.push({
    id: `m${suggestion.messages.length + 1}`,
    from: 'me',
    at: now,
    body: body.trim(),
  });
  suggestion.updatedAt = now;
}

export async function updateNotify(
  id: string,
  notify: Partial<Suggestion['notify']>,
): Promise<void> {
  const suggestion = find(id);
  suggestion.notify = { ...suggestion.notify, ...notify };
}
