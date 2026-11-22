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

/** 단답형(short)과 장문형(long) */
export interface TextQuestion extends QuestionBase {
  type: 'short' | 'long';
  maxLength: number;
  placeholder?: string;
}

/** 문항 형식: 단일 선택, 복수 선택, 단답형, 장문형 (기능 명세서 5.3) */
export type Question =
  SingleChoiceQuestion | MultipleChoiceQuestion | TextQuestion;

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

/** draft는 이 화면 안에서만 이어 쓰는 답이다 (서버에는 제출한 응답만 남는다). */
export type MyResponseStatus = 'none' | 'draft' | 'submitted';

/**
 * 설문. 응답자의 이름은 수집하지 않는다.
 * collectsClass면 학년·반을 함께 받고, 회원가입 때 학년·반을 입력한 사람만 응답할 수 있다.
 */
export interface Survey {
  id: string;
  title: string;
  /** 설문 설명 (카드와 설문 맨 위 안내문) */
  intro: string;
  department: string;
  audience: string;
  collectsClass: boolean;
  /**
   * 연결 활동. 연결된 활동이 있어야 설문을 게시할 수 있다.
   * 학생에게는 학생회 공개 범위의 활동이면 비어 있다.
   */
  activity?: { id: string; title: string };
  /** ISO 8601. 이 시각까지 응답을 받는다. */
  closesAt: string;
  questions: Question[];
  /** 응답 수와 응답 대상 인원 (참여율) */
  responses: number;
  target: number;
}

export interface SurveySummary extends Omit<Survey, 'questions'> {
  questionCount: number;
  isClosed: boolean;
  myStatus: MyResponseStatus;
  /** 지금 응답할 수 있는지 (진행 중, 아직 응답하지 않았고, 응답 대상 학년·반) */
  canRespond: boolean;
}

export interface SurveyWithResponse extends Survey {
  isClosed: boolean;
  myStatus: MyResponseStatus;
  canRespond: boolean;
  myAnswers: Answers;
}
