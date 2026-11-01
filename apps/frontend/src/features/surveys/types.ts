export type SurveyIdentity = 'anonymous' | 'student-id' | 'named';

interface QuestionBase {
  id: string;
  title: string;
  required: boolean;
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single';
  options: string[];
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple';
  options: string[];
  maxSelections?: number;
}

export interface ScaleQuestion extends QuestionBase {
  type: 'scale';
  steps: number;
  minLabel: string;
  maxLabel: string;
}

export interface TextQuestion extends QuestionBase {
  type: 'text';
  maxLength: number;
  placeholder?: string;
}

export type Question =
  SingleChoiceQuestion | MultipleChoiceQuestion | ScaleQuestion | TextQuestion;

export type AnswerValue = string | string[] | number;
export type Answers = Record<string, AnswerValue>;

export type MyResponseStatus = 'none' | 'draft' | 'submitted';

export interface Survey {
  id: string;
  title: string;
  department: string;
  audience: string;
  identity: SurveyIdentity;
  /** ISO 8601. 이 시각까지 응답을 받는다. */
  closesAt: string;
  questions: Question[];
}

export interface SurveySummary extends Omit<Survey, 'questions'> {
  questionCount: number;
  isClosed: boolean;
  myStatus: MyResponseStatus;
}

export interface SurveyWithResponse extends Survey {
  isClosed: boolean;
  myStatus: MyResponseStatus;
  myAnswers: Answers;
}
