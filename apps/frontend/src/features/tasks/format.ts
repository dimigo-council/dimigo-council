import { dayDiff, formatShortDate } from '../../lib/date.ts';
import { activityNo } from '../activities/format.ts';
import type { Task } from './types.ts';

/** 마감까지 남은 날. 오늘 마감이면 0, 지났으면 음수. */
export function daysUntilDue(task: Pick<Task, 'dueAt'>, now = new Date()) {
  return dayDiff(now, new Date(task.dueAt));
}

/** 카드 아래 날짜: 11.20 마감, 오늘 마감, 11.06 완료 */
export function dueLabel(task: Task, now = new Date()) {
  if (task.status === '완료') {
    const done = [...task.logs].reverse().find((log) => log.status === '완료');
    return `${formatShortDate(done?.at ?? task.dueAt)} 완료`;
  }
  return daysUntilDue(task, now) === 0
    ? '오늘 마감'
    : `${formatShortDate(task.dueAt)} 마감`;
}

/** 오늘 마감이거나 마감이 지났으면 강조 */
export function isDueSoon(task: Task, now = new Date()) {
  return task.status !== '완료' && daysUntilDue(task, now) <= 0;
}

/** 카드 태그: 활동에 연결됐으면 활동 #024, 아니면 업무 태그 */
export function taskTag(task: Task) {
  return task.activity ? `활동 ${activityNo(task.activity.id)}` : task.tag;
}

/** <input type="date"> 값 (YYYY-MM-DD) */
export function toDateInput(iso: string | Date) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateInput(value: string) {
  return new Date(`${value}T18:00:00`).toISOString();
}
