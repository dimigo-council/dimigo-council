import type { Department } from '../members/types.ts';

export const activityStatuses = ['검토 중', '추진 중', '완료', '보류'] as const;
export type ActivityStatus = (typeof activityStatuses)[number];

/** 전체 공개: 모든 학생, 학생회: 학생회 임원만 */
export const activityScopes = ['전체 공개', '학생회'] as const;
export type ActivityScope = (typeof activityScopes)[number];

/** 추진 이력의 유형 */
export const historyKinds = ['질의', '회의', '협의', '추진', '보고'] as const;
export type HistoryKind = (typeof historyKinds)[number];

export interface ActivityHistory {
  id: string;
  kind: HistoryKind;
  /** ISO 날짜. 예정된 이력이면 없다. */
  at?: string;
  title: string;
  body?: string;
  link?: { label: string; to: string };
}

/** 활동 계획서 (활동 상세 오른쪽) */
export interface ActivityPlan {
  author: string;
  writtenAt: string;
  period: string;
  steps: { title: string; body: string }[];
  cooperation: string;
  staff: { role: string; name: string }[];
  cost: string;
  concerns: string;
}

export interface Activity {
  /** 활동 번호. 화면에는 #024처럼 보인다. */
  id: string;
  title: string;
  description: string;
  status: ActivityStatus;
  scope: ActivityScope;
  department: Department;
  /** 담당자. 공개 범위는 담당자만 바꿀 수 있다. */
  owner: string;
  registeredAt: string;
  /** 공감 수 (Figma 활동 목록의 하트. 기능 명세서에는 없다) */
  likes?: number;
  /** 연결된 질의 번호 (여러 개) */
  inquiryIds: string[];
  /** 오래된 이력이 앞. 예정된 이력은 맨 뒤. */
  history: ActivityHistory[];
  plan?: ActivityPlan;
}

export interface NewActivityInput {
  title: string;
  description: string;
  inquiryIds: string[];
  firstRecord: string;
  department: Department;
  owner: string;
  scope: ActivityScope;
}

/** 임시 저장한 활동 등록 내용 */
export type ActivityDraft = Partial<NewActivityInput>;

export interface NewHistoryInput {
  kind: HistoryKind;
  at: string;
  title: string;
  body?: string;
}
