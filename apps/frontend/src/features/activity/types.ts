import type { Agenda, AgendaRecord } from '../agendas/types.ts';

/**
 * 학생에게 보이는 안건. 업무공간 안건에서 전체 공개인 것만, 기록은 공개 기록만 남긴다.
 * 담당자 이름, 결정 사항 목록, 업무·보고서 수 같은 내부 정보는 빠진다.
 */
export type PublicAgenda = Pick<
  Agenda,
  | 'id'
  | 'title'
  | 'origins'
  | 'status'
  | 'department'
  | 'suggestionCount'
  | 'registeredAt'
  | 'updatedAt'
  | 'stageDates'
  | 'stageNotes'
  | 'expectedDoneAt'
  | 'summary'
  | 'survey'
  | 'related'
> & {
  records: Omit<AgendaRecord, 'author' | 'visibility'>[];
  /** 공개 범위 때문에 보이지 않는 내부 기록 수 */
  hiddenRecordCount: number;
  /** 내 건의가 이 안건에 묶여 있는지 */
  includesMine: boolean;
};
