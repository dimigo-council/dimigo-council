import { mockAgendas } from './mockData.ts';
import {
  agendaStages,
  finishedStatuses,
  type Agenda,
  type NewRecordInput,
} from './types.ts';

/**
 * 안건 API (업무공간). 학생 화면용 공개 안건 API(features/activity/api.ts)도 여기서 데이터를 받는다.
 * TODO: 백엔드 안건 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 지금은 메모리에만 저장하므로 새로고침하면 처음 상태로 돌아간다.
 */
export const isMockApi = true;

const agendas = structuredClone(mockAgendas);

function find(id: string) {
  const agenda = agendas.find((item) => item.id === id);
  if (!agenda) {
    throw new Response('안건을 찾을 수 없습니다.', { status: 404 });
  }
  return agenda;
}

export async function listAgendas(): Promise<Agenda[]> {
  return structuredClone(agendas).sort((a, b) =>
    b.id.localeCompare(a.id, undefined, { numeric: true }),
  );
}

export async function getAgenda(id: string): Promise<Agenda> {
  return structuredClone(find(id));
}

function nextRecordId(agenda: Agenda) {
  return `r${agenda.records.length + 1}`;
}

export async function addRecord(
  id: string,
  input: NewRecordInput,
): Promise<void> {
  const agenda = find(id);
  const now = new Date().toISOString();
  agenda.records.unshift({ id: nextRecordId(agenda), at: now, ...input });
  agenda.updatedAt = now;
}

/** 다음 단계로 넘기고 그 사실을 진행 기록에 남긴다. */
export async function advanceStage(id: string, author: string): Promise<void> {
  const agenda = find(id);
  if (finishedStatuses.includes(agenda.status)) {
    throw new Error('끝난 안건은 단계를 바꿀 수 없습니다.');
  }
  const index = agendaStages.findIndex((stage) => stage === agenda.status);
  const previous = agendaStages[index];
  const next = agendaStages[index + 1];
  const now = new Date().toISOString();
  agenda.status = next;
  agenda.stageDates[next] = now;
  agenda.updatedAt = now;
  agenda.records.unshift({
    id: nextRecordId(agenda),
    stage: next,
    at: now,
    title: `${previous}에서 넘어옴`,
    author,
    visibility: 'internal',
  });
}
