import { api, listAll, notFoundAs } from '../../lib/api.ts';
import { withIGa } from '../../lib/korean.ts';
import { numericId } from '../activities/api.ts';
import { departmentIdOf } from '../members/api.ts';
import type { DepartmentRef } from '../members/types.ts';
import type {
  NewTaskInput,
  Task,
  TaskEdit,
  TaskLog,
  TaskStatus,
} from './types.ts';

/**
 * 업무 API (백엔드 /tasks, 학생회만). 진행 기록(배정·수정)과 연결 활동의 추진 이력은 서버가 남긴다.
 * 서버의 날짜(YYYY-MM-DD, 서울)는 화면에서 그날 18시(서울)로 다룬다.
 */

interface PersonRef {
  id: string;
  name: string | null;
}

interface TaskResponse {
  id: number;
  title: string;
  tag: string | null;
  activity: { id: number; title: string } | null;
  assigner: PersonRef | null;
  department: DepartmentRef | null;
  assignee: PersonRef | null;
  startAt: string;
  dueAt: string;
  status: TaskStatus;
  logs?: {
    id: number;
    at: string;
    kind: string;
    text: string;
    status: TaskStatus | null;
  }[];
}

const notFound = notFoundAs('업무를 찾을 수 없습니다.');

/** 서버 날짜 → 화면 시각 */
function fromDay(day: string) {
  return `${day}T18:00:00+09:00`;
}

/** 화면 시각 → 서버 날짜 (서울 기준) */
export function toDay(iso: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

function toTask(row: TaskResponse): Task {
  return {
    id: String(row.id),
    title: row.title,
    ...(row.tag && { tag: row.tag }),
    ...(row.activity && {
      activity: { id: String(row.activity.id), title: row.activity.title },
    }),
    assigner: row.assigner?.name ?? '',
    department: row.department?.name ?? '',
    assignee: row.assignee?.name ?? '',
    ...(row.assignee && { assigneeId: row.assignee.id }),
    startAt: fromDay(row.startAt),
    dueAt: fromDay(row.dueAt),
    status: row.status,
    logs: (row.logs ?? []).map((log): TaskLog => ({
      id: String(log.id),
      at: log.at,
      label: log.kind,
      text: log.text,
      ...(log.status && { status: log.status }),
    })),
  };
}

export interface TaskQuery {
  activityId?: string;
  /** 나의 업무 */
  mine?: boolean;
}

/** 업무 목록 (마감일순) */
export async function listTasks(query: TaskQuery = {}): Promise<Task[]> {
  const rows = await listAll<TaskResponse>('/tasks', {
    activityId: query.activityId && numericId(query.activityId),
    mine: query.mine,
  });
  return rows.map(toTask);
}

export async function getTask(id: string): Promise<Task> {
  return toTask(
    await api<TaskResponse>(`/tasks/${numericId(id)}`).catch(notFound),
  );
}

export async function createTask(input: NewTaskInput): Promise<string> {
  const created = await api<TaskResponse>('/tasks', {
    method: 'POST',
    body: {
      title: input.title.trim(),
      activityId: input.activity ? numericId(input.activity.id) : null,
      departmentId: await departmentIdOf(input.department),
      ...(input.assigneeId && { assigneeId: input.assigneeId }),
      startAt: toDay(input.startAt),
      dueAt: toDay(input.dueAt),
      status: input.status,
    },
  });
  return String(created.id);
}

/** 기록 추가. 한 줄 내용과 그때의 상태를 남기고, 그 상태를 업무의 현재 상태로 삼는다. */
export async function addTaskLog(
  id: string,
  status: TaskStatus,
  text: string,
): Promise<void> {
  await api(`/tasks/${numericId(id)}/logs`, {
    method: 'POST',
    body: { text: text.trim(), status },
  });
}

/** 업무 수정. 바뀐 내용은 서버가 진행 기록에 남긴다. */
export async function updateTask(id: string, edit: TaskEdit): Promise<void> {
  await api(`/tasks/${numericId(id)}`, {
    method: 'PATCH',
    body: {
      title: edit.title.trim(),
      activityId: edit.activity ? numericId(edit.activity.id) : null,
      departmentId: await departmentIdOf(edit.department),
      ...(edit.assigneeId && { assigneeId: edit.assigneeId }),
      startAt: toDay(edit.startAt),
      dueAt: toDay(edit.dueAt),
    },
  });
}

/** 홈 "나의 업무" 체크: 완료로 바꾸거나 진행 중으로 되돌린다. */
export async function setTaskDone(
  id: string,
  done: boolean,
  by: string,
): Promise<void> {
  await addTaskLog(
    id,
    done ? '완료' : '진행 중',
    done
      ? `${withIGa(by)} 업무를 완료했어요.`
      : `${withIGa(by)} 업무를 다시 열었어요.`,
  );
}
