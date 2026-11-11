import type { AgendaVisibility } from '../agendas/types.ts';

/** 업무 상태. KIT 상태 매핑의 "마감 지남"은 상태가 아니라 마감일로 정해진다. */
export const taskStatuses = ['할 일', '진행 중', '검토 요청', '완료'] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
  owner: string;
}

/** 업무로 만든 결과물 (설문, 파일 등) */
export interface TaskOutput {
  id: string;
  kind: 'survey' | 'file';
  title: string;
  meta: string;
  to?: string;
}

/** 업무 활동: event는 시스템이 남긴 기록, comment는 구성원이 쓴 댓글 */
export interface TaskActivity {
  id: string;
  kind: 'event' | 'comment';
  author: string;
  at: string;
  text: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  /** 업무를 낸 부서 */
  department: string;
  requester: string;
  assignees: string[];
  /** 안건에 묶인 업무면 그 안건 */
  agenda?: { id: string; title: string };
  /** 안건 없이 하는 일의 묶음 (정기 회의 운영 등) */
  group?: string;
  dueAt: string;
  doneAt?: string;
  body: string;
  visibility: AgendaVisibility;
  checklist: TaskChecklistItem[];
  outputs: TaskOutput[];
  activity: TaskActivity[];
}

export interface NewTaskInput {
  title: string;
  body: string;
  agenda?: { id: string; title: string };
  assignee: string;
  dueAt: string;
  requester: string;
  department: string;
}
