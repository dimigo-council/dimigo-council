import { formatShortDate } from '../../lib/date.ts';
import { withIGa, withRo } from '../../lib/korean.ts';
import { mockTasks } from './mockData.ts';
import type {
  NewTaskInput,
  Task,
  TaskEdit,
  TaskLog,
  TaskStatus,
} from './types.ts';

/**
 * 업무 API.
 * TODO: 백엔드 업무 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 지금은 메모리에만 저장하므로 새로고침하면 처음 상태로 돌아간다.
 */
export const isMockApi = true;

const tasks = structuredClone(mockTasks);

function find(id: string) {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    throw new Response('업무를 찾을 수 없습니다.', { status: 404 });
  }
  return task;
}

function log(task: Task, entry: Omit<TaskLog, 'id' | 'at'>) {
  const numbers = task.logs.map((item) => Number(item.id.slice(1)) || 0);
  task.logs.push({
    id: `l${Math.max(0, ...numbers) + 1}`,
    at: new Date().toISOString(),
    ...entry,
  });
  // 가장 최근에 기록된 상태가 업무의 현재 상태다.
  if (entry.status) task.status = entry.status;
}

export async function listTasks(): Promise<Task[]> {
  return structuredClone(tasks).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export async function getTask(id: string): Promise<Task> {
  return structuredClone(find(id));
}

export async function createTask(input: NewTaskInput): Promise<string> {
  const id = String(Math.max(...tasks.map((item) => Number(item.id))) + 1);
  const task: Task = {
    id,
    title: input.title.trim(),
    ...(input.activity && { activity: input.activity }),
    assigner: input.assigner,
    department: input.department,
    assignee: input.assignee,
    startAt: input.startAt,
    dueAt: input.dueAt,
    status: input.status,
    logs: [],
  };
  log(task, {
    label: '배정',
    text:
      input.assignee === input.assigner
        ? `${withIGa(input.assigner)} 업무를 만들었어요.`
        : `${withIGa(input.assigner)} ${input.assignee}에게 업무를 배정했어요.`,
    status: input.status,
  });
  tasks.push(task);
  return id;
}

/** 기록 추가. 한 줄 내용과 그때의 상태를 남기고, 그 상태를 업무의 현재 상태로 삼는다. */
export async function addTaskLog(
  id: string,
  status: TaskStatus,
  text: string,
): Promise<void> {
  log(find(id), { label: status, text: text.trim(), status });
}

/** 업무 수정. 바뀐 내용은 진행 기록에 자동으로 남긴다. */
export async function updateTask(
  id: string,
  edit: TaskEdit,
  by: string,
): Promise<void> {
  const task = find(id);
  const changes: string[] = [];
  if (edit.title.trim() !== task.title) changes.push('제목을');
  if (edit.activity?.id !== task.activity?.id) changes.push('연결된 활동을');
  if (edit.department !== task.department) changes.push('담당 부서를');
  if (edit.assignee !== task.assignee) {
    changes.push(`담당자를 ${task.assignee}에서 ${withRo(edit.assignee)}`);
  }
  if (formatShortDate(edit.startAt) !== formatShortDate(task.startAt)) {
    changes.push(
      `시작일을 ${formatShortDate(task.startAt)}에서 ${formatShortDate(edit.startAt)}로`,
    );
  }
  if (formatShortDate(edit.dueAt) !== formatShortDate(task.dueAt)) {
    changes.push(
      `마감일을 ${formatShortDate(task.dueAt)}에서 ${formatShortDate(edit.dueAt)}로`,
    );
  }
  if (changes.length === 0) return;
  Object.assign(task, { ...edit, title: edit.title.trim() });
  if (!edit.activity) delete task.activity;
  log(task, {
    label: '수정',
    text: `${withIGa(by)} ${changes.join(', ')} 바꿨어요.`,
  });
}

/** 홈 "나의 업무" 체크: 완료로 바꾸거나 진행 중으로 되돌린다. */
export async function setTaskDone(
  id: string,
  done: boolean,
  by: string,
): Promise<void> {
  log(find(id), {
    label: done ? '완료' : '진행 중',
    text: done
      ? `${withIGa(by)} 업무를 완료했어요.`
      : `${withIGa(by)} 업무를 다시 열었어요.`,
    status: done ? '완료' : '진행 중',
  });
}
