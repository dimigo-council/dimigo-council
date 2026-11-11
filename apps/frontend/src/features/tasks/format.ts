import { dayDiff, formatDate, formatShortDate } from '../../lib/date.ts';
import type { Task } from './types.ts';

/** 마감까지 남은 날. 오늘 마감이면 0, 지났으면 음수. */
export function daysUntilDue(task: Pick<Task, 'dueAt'>, now = new Date()) {
  return dayDiff(now, new Date(task.dueAt));
}

export function isOverdue(
  task: Pick<Task, 'dueAt' | 'status'>,
  now = new Date(),
) {
  return task.status !== '완료' && daysUntilDue(task, now) < 0;
}

/** 업무 목록의 묶음. 마감 지남 → 일주일 안 → 그 뒤 → 최근 완료 */
export const taskGroups = ['overdue', 'week', 'later', 'done'] as const;
export type TaskGroup = (typeof taskGroups)[number];

export const taskGroupLabel: Record<TaskGroup, string> = {
  overdue: '마감 지남',
  week: '일주일 안',
  later: '그 뒤',
  done: '최근 완료',
};

export function taskGroup(task: Task, now = new Date()): TaskGroup {
  if (task.status === '완료') return 'done';
  const days = daysUntilDue(task, now);
  if (days < 0) return 'overdue';
  return days < 7 ? 'week' : 'later';
}

/** 목록 오른쪽 날짜: 11.3 (화), 오늘 마감, 10.24 · 2일 지남, 10.20 완료 */
export function dueLabel(task: Task, now = new Date()) {
  if (task.status === '완료') {
    return `${formatShortDate(task.doneAt ?? task.dueAt)} 완료`;
  }
  const days = daysUntilDue(task, now);
  if (days < 0) return `${formatShortDate(task.dueAt)} · ${-days}일 지남`;
  if (days === 0) return '오늘 마감';
  return formatDate(task.dueAt);
}

/** 마감 표시 색: 지났으면 danger, 오늘·내일이면 warn */
export function dueTone(task: Task, now = new Date()) {
  if (task.status === '완료') return undefined;
  const days = daysUntilDue(task, now);
  if (days < 0) return 'danger';
  return days <= 1 ? 'warn' : undefined;
}
