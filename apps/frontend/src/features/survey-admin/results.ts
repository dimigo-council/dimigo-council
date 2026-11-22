import { formatDateTime } from '../../lib/date.ts';
import type { AnswerValue } from '../surveys/types.ts';
import { questionTypeLabel } from './format.ts';
import type { AdminSurvey, SurveyResponse } from './types.ts';

/**
 * 설문 결과 표시 (기능 명세서 SRV-R2, Figma 학생회 / 설문 결과).
 * 문항별 분석은 서버가 하고(GET /surveys/:id/results), 여기서는 표시와 CSV만 만든다.
 */

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
  const header = ['응답 번호', '제출 시각', '응답 시간(초)'];
  if (survey.collectsClass) header.push('학년', '반');
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
    response.durationSeconds ?? '',
  ];
  if (survey.collectsClass)
    row.push(response.grade ?? '', response.classNumber ?? '');
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
