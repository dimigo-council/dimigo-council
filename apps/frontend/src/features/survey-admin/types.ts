import type { statusTone } from '../../components/ui/index.ts';
import type { Answers, Survey } from '../surveys/types.ts';

/** 작성 중 → 예약(공개일을 기다림) → 공개. 공개된 설문의 진행 중·마감은 마감일로 정해진다. */
export type SurveyStage = 'draft' | 'scheduled' | 'published';

/** KIT 상태 매핑의 설문 상태 */
export type AdminSurveyStatus = keyof typeof statusTone.survey;

/** 학생회 화면에서 보는 설문. 학생 화면 설문에 작성·공개 정보가 붙는다. */
export interface AdminSurvey extends Omit<Survey, 'closesAt' | 'activity'> {
  stage: SurveyStage;
  /** 만든 사람 */
  owner: string;
  /** 연결 활동. 작성 중에는 비어 있을 수 있지만, 게시하려면 있어야 한다. */
  activity?: Survey['activity'];
  opensAt?: string;
  closesAt?: string;
  /** 마감일 전에 "응답 받기"를 끈 시각. 있으면 마감으로 본다. */
  closedAt?: string;
  /** 마지막 자동 저장 시각 */
  savedAt: string;
  /** 부서장에게 검토를 요청했는지 */
  reviewRequested: boolean;
}

/** 학생 한 명이 제출한 응답 (결과 내보내기 CSV의 한 줄) */
export interface SurveyResponse {
  id: string;
  /** 제출 순서. 1부터 */
  number: number;
  submittedAt: string;
  /** 설문을 열고 제출하기까지 걸린 시간. 모르면 비어 있다. */
  durationSeconds?: number;
  /** 학년·반을 수집하는 설문에서만 있다. 이름은 어떤 설문도 수집하지 않는다. */
  grade?: number;
  classNumber?: number;
  answers: Answers;
  /** 분석에서 뺀 응답. 응답 자체는 남는다. */
  excluded: boolean;
}

/** 문항별 결과 (서버가 분석에서 뺀 응답을 빼고 계산한다) */
export type QuestionResult =
  | {
      id: string;
      title: string;
      type: 'single' | 'multiple';
      answered: number;
      /** ratio는 이 문항에 답한 사람 대비라 복수 선택은 합이 1을 넘을 수 있다. */
      rows: { label: string; count: number; ratio: number }[];
    }
  | {
      id: string;
      title: string;
      type: 'short' | 'long';
      answered: number;
      /** 제출 순서 */
      answers: string[];
    };

export interface SurveyResults {
  survey: AdminSurvey;
  /** 분석에 들어간 응답 수 */
  respondents: number;
  target: number;
  /** 0~1 */
  participationRate: number;
  /** 마감까지 남은 날. 마감일이 없으면 null */
  daysLeft: number | null;
  questions: QuestionResult[];
}

/** 편집 화면에서 고치는 부분 */
export type SurveyDraft = Pick<
  AdminSurvey,
  | 'title'
  | 'intro'
  | 'audience'
  | 'collectsClass'
  | 'activity'
  | 'opensAt'
  | 'closesAt'
  | 'questions'
>;
