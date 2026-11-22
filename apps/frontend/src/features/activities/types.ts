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
  /** 담당 부서 이름. 없으면 빈 문자열 */
  department: Department;
  /** 담당자 이름. 없으면 빈 문자열 */
  owner: string;
  ownerId?: string;
  registeredAt: string;
  /**
   * 공감 수 (Figma 활동 목록의 하트. 기능 명세서와 서버에는 없다).
   * 하트는 화면 안에서만 켜고 끈다.
   */
  likes?: number;
  /** 연결된 질의 번호 (여러 개) */
  inquiryIds: string[];
  /** 연결된 설문 번호 */
  surveyIds: string[];
  /** 오래된 이력이 앞. 예정된 이력은 맨 뒤. 목록에서는 비어 있다. */
  history: ActivityHistory[];
  plan?: ActivityPlan;
  /** 공개 범위를 바꿀 수 있는지 (담당자, 담당자가 없으면 학생회 누구나). 상세에서만 온다. */
  canChangeScope?: boolean;
}

export interface NewActivityInput {
  title: string;
  description: string;
  inquiryIds: string[];
  firstRecord: string;
  department: Department;
  /** 담당자 사용자 id. 비우면 등록한 사람이 담당자가 된다. */
  ownerId: string;
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
