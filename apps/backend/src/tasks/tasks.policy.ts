import type { TaskLogKind, TaskStatus } from '#/db/schema/index';

/**
 * 진행 기록 유형 for a record added by hand (TSK-C2). The spec lists 배정, 진행
 * 중, 수정 and 완료: a record that completes the task is 완료, any other status
 * change is 진행 중, and a note without a status change is 수정.
 */
export function logKindFor(status: TaskStatus | undefined): TaskLogKind {
  if (status === '완료') return '완료';
  return status ? '진행 중' : '수정';
}
