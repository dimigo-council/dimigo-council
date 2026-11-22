import { dayDiff } from '../../lib/date.ts';
import type { AnswerValue } from './types.ts';

/** 마감까지 남은 날. 오늘 마감이면 0. */
export function daysLeft(iso: string, now = new Date()) {
  return dayDiff(now, new Date(iso));
}

export function formatDday(days: number) {
  return days === 0 ? '오늘 마감' : `D-${days}`;
}

/** 시안 기준 6문항 약 2분, 10문항 약 4분 */
export function estimatedMinutes(questionCount: number) {
  return Math.max(1, Math.round(questionCount * 0.4));
}

/** 응답자 정보 안내. 이름은 어떤 설문도 수집하지 않는다. */
export function respondentNotice(collectsClass: boolean) {
  return collectsClass
    ? '이름은 수집하지 않고 학년과 반만 함께 받아요. 회원가입 때 학년·반을 입력한 학생만 응답할 수 있어요.'
    : '이름과 학년·반을 수집하지 않아요. 중복 참여를 막기 위해 참여 여부만 기록해요.';
}

/** 응답자 정보 짧은 표시 */
export function respondentLabel(collectsClass: boolean) {
  return collectsClass ? '학년·반 수집' : '이름 미수집';
}

/** 참여율 0~1 */
export function participation(survey: { responses: number; target: number }) {
  return survey.target > 0 ? Math.min(1, survey.responses / survey.target) : 0;
}

export function isAnswered(value: AnswerValue | undefined) {
  if (value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}
