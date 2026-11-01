import { dayDiff } from '../../lib/date.ts';
import type { AnswerValue, SurveyIdentity } from './types.ts';

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

export const identityLabel: Record<SurveyIdentity, string> = {
  anonymous: '익명',
  'student-id': '학번만 수집',
  named: '실명',
};

export const identityNotice: Record<SurveyIdentity, string> = {
  anonymous:
    '익명 설문입니다. 학생회는 응답 내용과 응답자를 연결해 볼 수 없고, 중복 참여를 막기 위해 참여 여부만 기록합니다.',
  'student-id':
    '학번만 수집하는 설문입니다. 응답 대상인지 확인하는 데만 쓰고, 이름은 수집하지 않습니다.',
  named: '실명 설문입니다. 담당 부서가 응답자의 이름과 학번을 볼 수 있습니다.',
};

export function isAnswered(value: AnswerValue | undefined) {
  if (value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}
