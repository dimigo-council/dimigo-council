import type { statusTone } from '../../components/kit/index.ts';
import type { Answers, Survey } from '../surveys/types.ts';

/** 작성 중 → 예약(공개일을 기다림) → 공개. 공개된 설문의 진행 중·마감은 마감일로 정해진다. */
export type SurveyStage = 'draft' | 'scheduled' | 'published';

/** KIT 상태 매핑의 설문 상태 */
export type AdminSurveyStatus = keyof typeof statusTone.survey;

/** 업무공간에서 보는 설문. 학생 화면 설문에 작성·공개 정보가 붙는다. */
export interface AdminSurvey extends Omit<Survey, 'closesAt'> {
  stage: SurveyStage;
  /** 만든 사람 */
  owner: string;
  /** 설문 맨 위 안내문 */
  intro: string;
  opensAt?: string;
  closesAt?: string;
  /** 마감일 전에 "응답 받기"를 끈 시각. 있으면 마감으로 본다. */
  closedAt?: string;
  /** 마지막 자동 저장 시각 */
  savedAt: string;
  responses: number;
  /** 응답 대상 인원 */
  target: number;
  /** 부서장에게 검토를 요청했는지 */
  reviewRequested: boolean;
}

/** 학생 한 명이 제출한 응답 (설문 결과의 개별 보기) */
export interface SurveyResponse {
  id: string;
  /** 제출 순서. 1부터 */
  number: number;
  submittedAt: string;
  /** 설문을 열고 제출하기까지 걸린 시간 */
  durationSeconds: number;
  grade: 1 | 2 | 3;
  /** 학번만 수집하는 설문·실명 설문에서만 있다 */
  studentId?: string;
  /** 실명 설문에서만 있다 */
  name?: string;
  answers: Answers;
  /** 성의 없는 응답 등으로 분석에서 뺀 응답. 응답 자체는 남는다. */
  excluded: boolean;
}

export interface SurveyResults {
  survey: AdminSurvey;
  /** 제출 순서대로 */
  responses: SurveyResponse[];
}

/** 편집 화면에서 고치는 부분 */
export type SurveyDraft = Pick<
  AdminSurvey,
  | 'title'
  | 'intro'
  | 'audience'
  | 'identity'
  | 'opensAt'
  | 'closesAt'
  | 'questions'
>;
