import type { Department } from '../members/types.ts';

/** 업무 상태. 업무 보드의 열 순서이기도 하다. */
export const taskStatuses = ['예정됨', '진행 중', '검토 요청', '완료'] as const;
export type TaskStatus = (typeof taskStatuses)[number];

/**
 * 진행 기록 한 줄. label은 기록 유형(배정, 진행 중, 수정, 완료 …)이고,
 * 상태를 바꾼 기록이면 status에 바뀐 뒤 상태가 남는다. 가장 최근 status가 업무의 현재 상태다.
 */
export interface TaskLog {
  id: string;
  at: string;
  label: string;
  text: string;
  status?: TaskStatus;
}

/** 업무는 공개 범위가 없다. 전체 공개 활동에 연결된 업무만 활동과 함께 공개된다. */
export interface Task {
  /** 업무 번호 */
  id: string;
  title: string;
  /** 활동이 없을 때 카드에 보이는 태그 (행사, 회의, 홍보 …) */
  tag?: string;
  activity?: { id: string; title: string };
  /** 업무를 배정한 사람 이름 */
  assigner: string;
  /** 담당 부서 이름. 없으면 빈 문자열 */
  department: Department;
  /** 담당자 이름. 없으면 빈 문자열 */
  assignee: string;
  assigneeId?: string;
  /** ISO 시각 (서버의 날짜에 서울 18시를 붙인 것) */
  startAt: string;
  dueAt: string;
  status: TaskStatus;
  /** 오래된 기록이 앞. 목록에서는 비어 있다. */
  logs: TaskLog[];
}

export interface NewTaskInput {
  title: string;
  activity?: { id: string; title: string };
  department: Department;
  /** 담당자 사용자 id */
  assigneeId: string;
  startAt: string;
  dueAt: string;
  status: TaskStatus;
}

/** 업무 수정에서 고칠 수 있는 것 */
export type TaskEdit = Pick<
  Task,
  'title' | 'activity' | 'department' | 'startAt' | 'dueAt'
> & { assigneeId: string };
