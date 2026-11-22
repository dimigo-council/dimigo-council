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

/** 서버에 저장된 질의. 화면에는 InquiryView로만 나간다. */
export interface Inquiry {
  /** 질의 번호. 화면에는 #128처럼 보인다. */
  id: string;
  title: string;
  body: string;
  scope: InquiryScope;
  /** 익명이면 학생회에도 이름·학년·반이 보이지 않는다. 전체 공개일 때만 고를 수 있다. */
  anonymous: boolean;
  authorName: string;
  /** 예: 2학년 5반 */
  authorClass: string;
  status: InquiryStatus;
  department?: Department;
  answer?: InquiryAnswer;
  /** 상태가 바뀐 날짜 */
  statusDates: Partial<Record<InquiryStatus, string>>;
  submittedAt: string;
  /** 공감한 학생 이름 */
  likedBy: string[];
  /** 공감 수 (예시 데이터의 다른 학생 공감 포함) */
  likes: number;
  activity?: { id: string; title: string };
}

/**
 * 화면에 보이는 질의. 익명 질의는 작성자를 비운다 (작성자 본인 제외).
 * 답변은 지금 질의한 학생에게만 보인다 (기능 명세서 SGT-U1, 7장 결정 전).
 */
export interface InquiryView extends Omit<
  Inquiry,
  'authorName' | 'authorClass' | 'likedBy' | 'answer'
> {
  /** 익명이면 null */
  author: string | null;
  authorClass: string | null;
  answer?: InquiryAnswer;
  mine: boolean;
  liked: boolean;
}

export interface NewInquiryInput {
  title: string;
  body: string;
  scope: InquiryScope;
  anonymous: boolean;
}
