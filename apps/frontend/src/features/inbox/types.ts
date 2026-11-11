import type {
  SuggestionCategory,
  SuggestionIdentity,
  SuggestionStatus,
} from '../suggestions/types.ts';

/** 건의 접수함의 건의 한 건. 학생 화면 "내 건의"와 같은 건의를 학생회 쪽에서 본 모습이다. */
export interface InboxSuggestion {
  id: string;
  category: SuggestionCategory;
  title: string;
  body: string;
  identity: SuggestionIdentity;
  /** 실명 건의면 보낸 학생 (예: 2학년 3반 홍길동). 익명이면 없다. */
  author?: string;
  status: SuggestionStatus;
  receivedAt: string;
  updatedAt: string;
  /** 맡은 부서. 없으면 배정 전 */
  department?: string;
  /** 맡은 사람 */
  handler?: string;
  /** 안건으로 채택됐으면 그 안건 */
  agenda?: { id: string; title: string };
  /** 학생에게 보낸 답변 (답변 완료·반려·안건 채택) */
  answer?: string;
}

/** 검토를 끝내는 방법 */
export type InboxResult = Extract<
  SuggestionStatus,
  '답변 완료' | '안건 채택' | '반려'
>;

export interface ResolveInput {
  result: InboxResult;
  answer: string;
  /** 안건 채택이면 묶을 안건 */
  agenda?: { id: string; title: string };
  handler: string;
}
