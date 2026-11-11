import { formatDateTime } from '../../lib/date.ts';
import { identityLabel, isAnswered } from '../surveys/format.ts';
import type {
  AnswerValue,
  MultipleChoiceQuestion,
  Question,
  ScaleQuestion,
  SingleChoiceQuestion,
  TextQuestion,
} from '../surveys/types.ts';
import { questionTypeLabel } from './format.ts';
import type { AdminSurvey, SurveyResponse } from './types.ts';

/**
 * 설문 결과 분석. 화면(요약·질문·개별 보기)은 응답 목록을 받아 여기서 계산한다.
 * 분석에서 뺀 응답은 호출하는 쪽에서 미리 걸러 넘긴다(responsesIncludedInAnalysis).
 */

export const grades = [1, 2, 3] as const;
export type Grade = (typeof grades)[number];

/** 이보다 응답자가 적은 학년은 필터·교차표에서 숨긴다. 몇 명 안 되면 누가 답했는지 짐작할 수 있다. */
export const minimumGroupSize = 5;

/** 응답 시간이 이보다 짧으면 성의 없는 응답일 수 있다고 알린다. */
export const suspiciouslyFastSeconds = 20;

export function responsesIncludedInAnalysis(responses: SurveyResponse[]) {
  return responses.filter((response) => !response.excluded);
}

export function responsesFromGrade(responses: SurveyResponse[], grade: Grade) {
  return responses.filter((response) => response.grade === grade);
}

/** 응답자가 minimumGroupSize명 이상이라 따로 보여줘도 되는 학년 */
export function visibleGrades(responses: SurveyResponse[]): Grade[] {
  return grades.filter(
    (grade) => responsesFromGrade(responses, grade).length >= minimumGroupSize,
  );
}

/** 전체 가운데 몇 분의 몇인지(0~1). 전체가 0이면 0이다. */
export function shareOf(count: number, total: number) {
  if (total === 0) return 0;
  return count / total;
}

export function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((smaller, larger) => smaller - larger);
  const middleIndex = Math.floor((sorted.length - 1) / 2);
  return sorted[middleIndex];
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
}

export interface CountRow {
  label: string;
  count: number;
  /** 0~1. 객관식은 응답 수 대비, 복수 선택은 응답자 대비라 합이 1을 넘을 수 있다. */
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

export interface ScaleSummary extends ChoiceSummary {
  mean: number;
  median: number;
  /** 위쪽 두 단계(5단계면 4·5)를 고른 비율 */
  topTwo: number;
}

export function scaleSteps(question: ScaleQuestion) {
  return Array.from({ length: question.steps }, (_, index) => index + 1);
}

export function summarizeScale(
  question: ScaleQuestion,
  responses: SurveyResponse[],
): ScaleSummary {
  const scores = answeredValues(question, responses).filter(
    (value): value is number => typeof value === 'number',
  );
  const rows = scaleSteps(question).map((step) => {
    const count = scores.filter((score) => score === step).length;
    return { label: String(step), count, ratio: shareOf(count, scores.length) };
  });

  const lowestTopTwoScore = question.steps - 1;
  const topTwoCount = scores.filter(
    (score) => score >= lowestTopTwoScore,
  ).length;

  return {
    answered: scores.length,
    rows,
    mean: average(scores),
    median: median(scores),
    topTwo: shareOf(topTwoCount, scores.length),
  };
}

/** 띄어쓰기·문장부호·대소문자만 다른 답은 같은 답으로 센다. */
export function normalizeAnswer(text: string) {
  return text.toLowerCase().replace(/[\s.,!?~·…'"“”‘’()[\]-]/g, '');
}

export interface TextVariant {
  text: string;
  count: number;
}

export interface TextGroup {
  /** 가장 많이 쓴 표현 */
  label: string;
  count: number;
  ratio: number;
  variants: TextVariant[];
}

export interface TextSummary {
  answered: number;
  groups: TextGroup[];
}

/** 정규화한 답이 같은 것끼리 모으고, 그 안에서 표현(원문)별로 센다. */
function countVariantsBySameAnswer(texts: string[]) {
  const variantCountsByAnswer = new Map<string, Map<string, number>>();
  for (const text of texts) {
    const answerKey = normalizeAnswer(text);
    const variantCounts =
      variantCountsByAnswer.get(answerKey) ?? new Map<string, number>();
    variantCounts.set(text, (variantCounts.get(text) ?? 0) + 1);
    variantCountsByAnswer.set(answerKey, variantCounts);
  }
  return [...variantCountsByAnswer.values()];
}

function toTextGroup(
  variantCounts: Map<string, number>,
  totalAnswered: number,
): TextGroup {
  const variants = [...variantCounts.entries()]
    .map(([text, count]) => ({ text, count }))
    .sort((first, second) => second.count - first.count);
  const count = variants.reduce((sum, variant) => sum + variant.count, 0);
  const mostUsedVariant = variants[0];
  return {
    label: mostUsedVariant.text,
    count,
    ratio: shareOf(count, totalAnswered),
    variants,
  };
}

function byCountThenLabel(first: TextGroup, second: TextGroup) {
  if (first.count !== second.count) return second.count - first.count;
  return first.label.localeCompare(second.label);
}

export function summarizeText(
  question: TextQuestion,
  responses: SurveyResponse[],
): TextSummary {
  const texts = answeredValues(question, responses)
    .filter((value): value is string => typeof value === 'string')
    .map((text) => text.trim());
  const groups = countVariantsBySameAnswer(texts)
    .map((variantCounts) => toTextGroup(variantCounts, texts.length))
    .sort(byCountThenLabel);
  return { answered: texts.length, groups };
}

export interface TextAnswer {
  response: SurveyResponse;
  text: string;
}

/** 주관식 문항에 실제로 글을 쓴 응답만 원문과 함께 (하나씩 보기) */
export function textAnswers(
  question: TextQuestion,
  responses: SurveyResponse[],
): TextAnswer[] {
  const answers: TextAnswer[] = [];
  for (const response of responses) {
    const value = response.answers[question.id];
    if (typeof value !== 'string') continue;

    const text = value.trim();
    if (!text) continue;

    answers.push({ response, text });
  }
  return answers;
}

/** 이 응답이 그 문항에서 이 답을 골랐는지 (질문 탭 → 개별 보기로 이어 볼 때) */
export function hasChosenAnswer(
  response: SurveyResponse,
  questionId: string,
  answer: string,
) {
  const value = response.answers[questionId];
  if (Array.isArray(value)) return value.includes(answer);
  return String(value) === answer;
}

export interface DayCount {
  /** 그날 0시 ISO */
  day: string;
  count: number;
}

function startOfDay(iso: string) {
  const date = new Date(iso);
  date.setHours(0, 0, 0, 0);
  return date;
}

function countResponsesByDay(responses: SurveyResponse[]) {
  const countByDay = new Map<string, number>();
  for (const response of responses) {
    const day = startOfDay(response.submittedAt).toISOString();
    countByDay.set(day, (countByDay.get(day) ?? 0) + 1);
  }
  return countByDay;
}

/** 공개일부터 마지막 응답일까지 날짜별 응답 수. 응답이 없는 날도 0으로 넣는다. */
export function dailyCounts(
  responses: SurveyResponse[],
  opensAt: string | undefined,
): DayCount[] {
  if (responses.length === 0) return [];

  const firstResponse = responses[0];
  const lastResponse = responses[responses.length - 1];
  const firstDay = startOfDay(opensAt ?? firstResponse.submittedAt);
  const lastDay = startOfDay(lastResponse.submittedAt);
  const countByDay = countResponsesByDay(responses);

  const days: DayCount[] = [];
  for (
    const day = new Date(firstDay);
    day <= lastDay;
    day.setDate(day.getDate() + 1)
  ) {
    const dayKey = day.toISOString();
    days.push({ day: dayKey, count: countByDay.get(dayKey) ?? 0 });
  }
  return days;
}

/** 130 → 2분 10초 */
export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (minutes === 0) return `${seconds}초`;
  if (seconds === 0) return `${minutes}분`;
  return `${minutes}분 ${seconds}초`;
}

/** 0.553 → 55% */
export function formatRatio(ratio: number) {
  return `${Math.round(ratio * 100)}%`;
}

/** 응답자 표시. 익명 설문은 학년만 보인다. */
export function respondentLabel(survey: AdminSurvey, response: SurveyResponse) {
  if (survey.identity === 'named' && response.name) {
    return `${response.name} (${response.studentId})`;
  }
  if (survey.identity === 'student-id' && response.studentId) {
    return response.studentId;
  }
  return `${identityLabel.anonymous} · ${response.grade}학년`;
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

/** 익명 설문은 학번을, 이름까지 받는 설문만 이름을 내보낸다. */
function identityColumns(survey: AdminSurvey) {
  const showsStudentId = survey.identity !== 'anonymous';
  const showsName = survey.identity === 'named';
  return { showsStudentId, showsName };
}

function csvHeader(survey: AdminSurvey) {
  const { showsStudentId, showsName } = identityColumns(survey);
  const header = ['응답 번호', '제출 시각', '응답 시간(초)', '학년'];
  if (showsStudentId) header.push('학번');
  if (showsName) header.push('이름');
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
  const { showsStudentId, showsName } = identityColumns(survey);
  const row: (string | number)[] = [
    response.number,
    formatDateTime(response.submittedAt),
    response.durationSeconds,
    response.grade,
  ];
  if (showsStudentId) row.push(response.studentId ?? '');
  if (showsName) row.push(response.name ?? '');
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
