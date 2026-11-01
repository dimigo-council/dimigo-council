export const suggestionCategories = [
  '급식',
  '시설',
  '기숙사',
  '학습',
  '행사',
  '학생회 운영',
  '기타',
] as const;
export type SuggestionCategory = (typeof suggestionCategories)[number];

/** KIT 상태 매핑의 건의 상태 */
export type SuggestionStatus =
  '접수 대기' | '검토 중' | '답변 완료' | '안건 채택' | '반려';

export const openStatuses: SuggestionStatus[] = ['접수 대기', '검토 중'];

export type SuggestionIdentity = 'named' | 'anonymous';

export interface SuggestionMessage {
  id: string;
  from: 'me' | 'council';
  /** 학생회 답변이면 담당 부서 */
  department?: string;
  /** 학생회 답변이면 담당자 이름 */
  staffName?: string;
  /** 처음 보낸 건의 원문이면 true */
  original?: boolean;
  at: string;
  body: string;
  action?: { label: string; to: string };
}

export interface SuggestionHistory {
  status: SuggestionStatus;
  at: string;
  note?: string;
}

export interface AgendaRef {
  id: string;
  title: string;
}

export interface LinkedAgenda {
  id: string;
  title: string;
  stage: string;
  stageNote?: string;
  suggestionCount: number;
}

export interface Suggestion {
  id: string;
  category: SuggestionCategory;
  title: string;
  identity: SuggestionIdentity;
  status: SuggestionStatus;
  department?: string;
  submittedAt: string;
  updatedAt: string;
  photos: string[];
  messages: SuggestionMessage[];
  history: SuggestionHistory[];
  linkedAgenda?: LinkedAgenda;
  /** 공개 안건 화면의 "이 안건에 의견 보태기"로 보낸 건의면 그 안건 */
  aboutAgenda?: AgendaRef;
  notify: { status: boolean; agenda: boolean };
}

export interface NewSuggestionInput {
  category: SuggestionCategory;
  title: string;
  body: string;
  identity: SuggestionIdentity;
  photos: string[];
  aboutAgenda?: AgendaRef;
}
