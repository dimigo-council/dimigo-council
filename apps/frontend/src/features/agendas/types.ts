import type { statusTone } from '../../components/kit/index.ts';

/** 안건이 차례로 거치는 단계. 보류·부결은 단계가 아니라 멈춘 상태다. */
export const agendaStages = ['등록', '검토', '결정', '추진', '완료'] as const;
export type AgendaStage = (typeof agendaStages)[number];

/** KIT 상태 매핑의 안건 상태 */
export type AgendaStatus = keyof typeof statusTone.agenda;

export const stoppedStatuses: AgendaStatus[] = ['보류', '부결'];
export const finishedStatuses: AgendaStatus[] = ['완료', ...stoppedStatuses];

/** 안건 단위 공개 범위. 전체 공개인 안건만 학생 화면(학생회 활동)에 나간다. */
export type AgendaVisibility = '학생회 내부' | '공개 검토 중' | '전체 공개';

export const agendaOrigins = ['건의', '학생회 자체', '설문'] as const;
export type AgendaOrigin = (typeof agendaOrigins)[number];

/** 진행 기록 한 줄. 공개 기록만 학생 화면에 나가고, 내부 기록은 개수만 보인다. */
export interface AgendaRecord {
  id: string;
  /** 단계가 바뀐 기록이면 그 단계 */
  stage?: AgendaStage;
  at: string;
  title: string;
  body?: string;
  author: string;
  visibility: 'internal' | 'public';
  link?: { label: string; to: string };
}

export interface RelatedRecord {
  title: string;
  /** 회의록, 완료된 안건 등 기록의 종류 */
  kind: string;
  at: string;
  to?: string;
}

export interface Agenda {
  id: string;
  title: string;
  status: AgendaStatus;
  department: string;
  owner: string;
  origins: AgendaOrigin[];
  /** 안건에 묶인 건의 수. 출처에 건의가 없으면 0 */
  suggestionCount: number;
  visibility: AgendaVisibility;
  registeredAt: string;
  registeredBy: string;
  updatedAt: string;
  /** 단계별로 들어선 날짜 */
  stageDates: Partial<Record<AgendaStage, string>>;
  /** 단계 아래에 덧붙이는 말 (예: 결정 → 정기회의) */
  stageNotes?: Partial<Record<AgendaStage, string>>;
  /** 아직 오지 않은 완료 단계의 목표일 */
  expectedDoneAt?: string;
  tasks: { done: number; total: number };
  reportCount: number;
  /** 학생 화면 "한눈에 보기"에 그대로 나가는 공개용 요약 */
  summary: { problem: string; decision?: string; now?: string };
  /** 업무공간 "결정 사항" */
  decisions?: string[];
  survey?: { title: string; to: string };
  records: AgendaRecord[];
  related: RelatedRecord[];
}

export interface NewRecordInput {
  title: string;
  body?: string;
  visibility: AgendaRecord['visibility'];
  author: string;
}
