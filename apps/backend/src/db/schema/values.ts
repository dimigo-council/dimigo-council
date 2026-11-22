/**
 * Allowed values for status and kind columns. They match the labels in
 * documents/기능_명세서.md and the frontend types, so the API sends them as is.
 */

export const departmentRoles = ['member', 'head'] as const;
export type DepartmentRole = (typeof departmentRoles)[number];

export const activityStatuses = ['검토 중', '추진 중', '완료', '보류'] as const;
export type ActivityStatus = (typeof activityStatuses)[number];

/** 전체 공개: every signed-in user; 학생회: only users with the isStudentCouncil bit. */
export const activityScopes = ['전체 공개', '학생회'] as const;
export type ActivityScope = (typeof activityScopes)[number];

export const activityHistoryKinds = [
  '질의',
  '회의',
  '협의',
  '추진',
  '보고',
] as const;
export type ActivityHistoryKind = (typeof activityHistoryKinds)[number];

export const taskStatuses = ['예정됨', '진행 중', '검토 요청', '완료'] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const taskLogKinds = ['배정', '진행 중', '수정', '완료'] as const;
export type TaskLogKind = (typeof taskLogKinds)[number];

export const inquiryStatuses = [
  '접수',
  '답변 완료',
  '처리 완료',
  '반려',
] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];

export const inquiryScopes = ['전체 공개', '학생회만'] as const;
export type InquiryScope = (typeof inquiryScopes)[number];

export const surveyStages = ['draft', 'published'] as const;
export type SurveyStage = (typeof surveyStages)[number];

/** single: 단일 선택, multiple: 복수 선택, short: 단답형, long: 장문형 */
export const surveyQuestionTypes = [
  'single',
  'multiple',
  'short',
  'long',
] as const;
export type SurveyQuestionType = (typeof surveyQuestionTypes)[number];

interface SurveyQuestionBase {
  id: string;
  title: string;
  required: boolean;
}

export type SurveyQuestion =
  | (SurveyQuestionBase & {
      type: 'single';
      options: string[];
    })
  | (SurveyQuestionBase & {
      type: 'multiple';
      options: string[];
      maxSelections?: number;
    })
  | (SurveyQuestionBase & {
      type: 'short' | 'long';
      maxLength: number;
      placeholder?: string;
    });

export type SurveyAnswers = Record<string, string | string[]>;

/** 활동 계획서. The frontend's ActivityPlan shape. */
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
