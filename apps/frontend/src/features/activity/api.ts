import { getAgenda, listAgendas } from '../agendas/api.ts';
import type { Agenda } from '../agendas/types.ts';
import { listMySuggestions } from '../suggestions/api.ts';
import type { PublicAgenda } from './types.ts';

/**
 * 공개 안건 API. 학생 화면이므로 전체 공개 안건과 공개 기록만 돌려준다.
 * TODO: 백엔드가 생기면 공개 범위 거르기와 "내 건의 포함" 계산은 서버가 해야 한다.
 * 지금은 업무공간 안건 데이터(features/agendas)를 받아 여기서 거른다.
 */
export const isMockApi = true;

async function myAgendaIds() {
  const suggestions = await listMySuggestions();
  return new Set(
    suggestions.flatMap((suggestion) =>
      suggestion.linkedAgenda ? [suggestion.linkedAgenda.id] : [],
    ),
  );
}

function toPublic(agenda: Agenda, mine: Set<string>): PublicAgenda {
  const publicRecords = agenda.records.filter(
    (record) => record.visibility === 'public',
  );
  return {
    id: agenda.id,
    title: agenda.title,
    status: agenda.status,
    department: agenda.department,
    origins: agenda.origins,
    suggestionCount: agenda.suggestionCount,
    registeredAt: agenda.registeredAt,
    updatedAt: agenda.updatedAt,
    stageDates: agenda.stageDates,
    stageNotes: agenda.stageNotes,
    expectedDoneAt: agenda.expectedDoneAt,
    summary: agenda.summary,
    survey: agenda.survey,
    related: agenda.related,
    records: publicRecords.map(
      ({ author: _author, visibility: _visibility, ...record }) => record,
    ),
    hiddenRecordCount: agenda.records.length - publicRecords.length,
    includesMine: mine.has(agenda.id),
  };
}

const isPublic = (agenda: Agenda) => agenda.visibility === '전체 공개';

export async function listPublicAgendas(): Promise<PublicAgenda[]> {
  const [agendas, mine] = await Promise.all([listAgendas(), myAgendaIds()]);
  return agendas
    .filter(isPublic)
    .map((agenda) => toPublic(agenda, mine))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPublicAgenda(id: string): Promise<PublicAgenda> {
  const notFound = () =>
    new Response('공개된 안건을 찾을 수 없습니다.', { status: 404 });
  const agenda = await getAgenda(id).catch(() => {
    throw notFound();
  });
  if (!isPublic(agenda)) throw notFound();
  return toPublic(agenda, await myAgendaIds());
}

/** 새 건의 화면의 "비슷한 내용이 이미 있어요". 제목의 두 글자 이상 낱말이 들어간 공개 안건. */
export async function findSimilarAgendas(
  title: string,
): Promise<PublicAgenda[]> {
  const words = title
    .split(/\s+/)
    .map((word) => word.replace(/[^가-힣a-zA-Z0-9]/g, ''))
    .filter((word) => word.length >= 2);
  if (words.length === 0) return [];
  const agendas = await listPublicAgendas();
  return agendas.filter((agenda) =>
    words.some(
      (word) =>
        agenda.title.includes(word) || agenda.title.includes(word.slice(0, 3)),
    ),
  );
}
