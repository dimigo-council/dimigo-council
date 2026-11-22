import type { Department } from '../members/types.ts';

/** 질의(질문과 건의)의 처리 상태 */
export const inquiryStatuses = [
  '접수',
  '답변 완료',
  '처리 완료',
  '반려',
] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];

/** 전체 공개: 모든 학생, 학생회만: 학생회와 작성자만. 작성자만 정하고 바꿀 수 있다. */
export const inquiryScopes = ['학생회만', '전체 공개'] as const;
export type InquiryScope = (typeof inquiryScopes)[number];

export interface InquiryAnswer {
  department: Department;
  body: string;
  at: string;
}

/**
 * 화면에 보이는 질의. 서버가 보는 사람에 맞춰 거른다: 익명 질의는 작성자를 비우고(작성자 본인 제외),
 * 답변과 반려 사유는 질의한 학생과 학생회에게만 온다 (기능 명세서 SGT-U1, 7장 결정 전).
 */
export interface InquiryView {
  /** 질의 번호. 화면에는 #128처럼 보인다. */
  id: string;
  title: string;
  body: string;
  scope: InquiryScope;
  /** 익명이면 학생회에도 이름·학년·반이 보이지 않는다. 전체 공개일 때만 고를 수 있다. */
  anonymous: boolean;
  /** 익명이면 null */
  author: string | null;
  /** 예: 2학년 5반 */
  authorClass: string | null;
  status: InquiryStatus;
  department?: Department;
  /** 답변. 반려된 질의는 반려 사유가 여기 온다. */
  answer?: InquiryAnswer;
  /** 상태가 바뀐 날짜 */
  statusDates: Partial<Record<InquiryStatus, string>>;
  submittedAt: string;
  likes: number;
  activity?: { id: string; title: string };
  mine: boolean;
  liked: boolean;
}

export interface NewInquiryInput {
  title: string;
  body: string;
  scope: InquiryScope;
  anonymous: boolean;
}
