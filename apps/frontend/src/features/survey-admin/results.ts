import { formatDateTime } from '../../lib/date.ts';
import { isAnswered } from '../surveys/format.ts';
import type {
  AnswerValue,
  MultipleChoiceQuestion,
  Question,
  SingleChoiceQuestion,
  TextQuestion,
} from '../surveys/types.ts';
import { questionTypeLabel } from './format.ts';
import type { AdminSurvey, SurveyResponse } from './types.ts';

/**
 * 설문 결과 분석 (기능 명세서 SRV-R2, Figma 학생회 / 설문 결과).
 * 분석에서 뺀 응답은 호출하는 쪽에서 미리 걸러 넘긴다(responsesIncludedInAnalysis).
 */

export function responsesIncludedInAnalysis(responses: SurveyResponse[]) {
  return responses.filter((response) => !response.excluded);
}

/** 전체 가운데 몇 분의 몇인지(0~1). 전체가 0이면 0이다. */
export function shareOf(count: number, total: number) {
  if (total === 0) return 0;
  return count / total;
}

export interface CountRow {
  label: string;
  count: number;
  /** 0~1. 단일 선택은 응답 수 대비, 복수 선택은 응답자 대비라 합이 1을 넘을 수 있다. */
  ratio: number;
}

export interface ChoiceSummary {
  answered: number;
  rows: CountRow[];
}

function answeredValues(question: Question, responses: SurveyResponse[]) {
  return responses
    .map((response) => response.answers[question.id])
    .filter(isAnswered);
}

function valueContainsOption(value: AnswerValue, option: string) {
  if (Array.isArray(value)) return value.includes(option);
  return value === option;
}

export function summarizeChoice(
  question: SingleChoiceQuestion | MultipleChoiceQuestion,
  responses: SurveyResponse[],
): ChoiceSummary {
  const values = answeredValues(question, responses);
  const rows = question.options.map((option) => {
    const count = values.filter((value) =>
      valueContainsOption(value, option),
    ).length;
    return { label: option, count, ratio: shareOf(count, values.length) };
  });
  return { answered: values.length, rows };
}

/** 단답형·장문형 문항에 실제로 글을 쓴 답 (제출 순서) */
export function textAnswers(
  question: TextQuestion,
  responses: SurveyResponse[],
): string[] {
  return responses.flatMap((response) => {
    const value = response.answers[question.id];
    if (typeof value !== 'string') return [];
    const text = value.trim();
    return text ? [text] : [];
  });
}

/** 0.553 → 55% */
export function formatRatio(ratio: number) {
  return `${Math.round(ratio * 100)}%`;
}

/** 엑셀이 한글을 깨뜨리지 않고 읽도록 파일 맨 앞에 붙인다. */
const utf8ByteOrderMark = '﻿';

function escapeCsvCell(value: string | number) {
  const text = String(value);
  const needsQuoting = /[",\n]/.test(text);
  if (!needsQuoting) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsvLine(cells: (string | number)[]) {
  return cells.map(escapeCsvCell).join(',');
}

function csvHeader(survey: AdminSurvey) {
  const header = ['응답 번호', '제출 시각', '응답 시간(초)', '학년'];
  if (survey.collectsClass) header.push('반');
  header.push('분석 제외');
  survey.questions.forEach((question, index) => {
    header.push(
      `Q${index + 1}. ${question.title} (${questionTypeLabel[question.type]})`,
    );
  });
  return header;
}

function answerAsCsvText(value: AnswerValue | undefined) {
  if (value === undefined) return '';
  if (Array.isArray(value)) return value.join('; ');
  return value;
}

function csvRow(survey: AdminSurvey, response: SurveyResponse) {
  const row: (string | number)[] = [
    response.number,
    formatDateTime(response.submittedAt),
    response.durationSeconds,
    response.grade,
  ];
  if (survey.collectsClass) row.push(response.classNumber ?? '');
  row.push(response.excluded ? '예' : '');
  for (const question of survey.questions) {
    row.push(answerAsCsvText(response.answers[question.id]));
  }
  return row;
}

/** 응답 전체를 CSV로. 분석에서 뺀 응답도 표시해 함께 내보낸다. */
export function responsesCsv(survey: AdminSurvey, responses: SurveyResponse[]) {
  const lines = [
    toCsvLine(csvHeader(survey)),
    ...responses.map((response) => toCsvLine(csvRow(survey, response))),
  ];
  return utf8ByteOrderMark + lines.join('\r\n');
}
