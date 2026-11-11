import { withRo } from '../../lib/korean.ts';
import { adjustAgendaCounts } from '../agendas/api.ts';
import { mockTasks } from './mockData.ts';
import type { NewTaskInput, Task, TaskStatus } from './types.ts';

/**
 * 업무 API.
 * TODO: 백엔드 업무 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 지금은 메모리에만 저장하므로 새로고침하면 처음 상태로 돌아간다.
 */
export const isMockApi = true;

const tasks = structuredClone(mockTasks);
let nextNumber = 419;

function find(id: string) {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    throw new Response('업무를 찾을 수 없습니다.', { status: 404 });
  }
  return task;
}

function log(
  task: Task,
  kind: 'event' | 'comment',
  author: string,
  text: string,
) {
  task.activity.push({
    id: `a${task.activity.length + 1}`,
    kind,
    author,
    at: new Date().toISOString(),
    text,
  });
}

export async function listTasks(): Promise<Task[]> {
  return structuredClone(tasks).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export async function getTask(id: string): Promise<Task> {
  return structuredClone(find(id));
}

export async function createTask(input: NewTaskInput): Promise<string> {
  const id = `T-${String(nextNumber++).padStart(4, '0')}`;
  const task: Task = {
    id,
    title: input.title.trim(),
    status: '할 일',
    department: input.department,
    requester: input.requester,
    assignees: [input.assignee],
    ...(input.agenda && { agenda: input.agenda }),
    ...(!input.agenda && { group: '기타' }),
    dueAt: input.dueAt,
    body: input.body.trim(),
    visibility: '학생회 내부',
    checklist: [],
    outputs: [],
    activity: [],
  };
  log(
    task,
    'event',
    input.requester,
    input.assignee === input.requester
      ? '업무를 만들었습니다.'
      : `${input.assignee}에게 업무를 배정했습니다.`,
  );
  tasks.push(task);
  if (input.agenda) await adjustAgendaCounts(input.agenda.id, { tasks: 1 });
  return id;
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  author: string,
): Promise<void> {
  const task = find(id);
  if (task.status === status) return;
  const doneChange =
    (status === '완료' ? 1 : 0) - (task.status === '완료' ? 1 : 0);
  if (task.agenda && doneChange) {
    await adjustAgendaCounts(task.agenda.id, { tasksDone: doneChange });
  }
  task.status = status;
  if (status === '완료') task.doneAt = new Date().toISOString();
  else delete task.doneAt;
  log(task, 'event', author, `상태를 ${withRo(status)} 바꿨습니다.`);
}

export async function toggleChecklistItem(
  id: string,
  itemId: string,
  done: boolean,
): Promise<void> {
  const item = find(id).checklist.find((entry) => entry.id === itemId);
  if (item) item.done = done;
}

export async function addTaskComment(
  id: string,
  author: string,
  text: string,
): Promise<void> {
  log(find(id), 'comment', author, text.trim());
}

export async function updateTaskBody(
  id: string,
  body: string,
  author: string,
): Promise<void> {
  const task = find(id);
  const next = body.trim();
  if (task.body === next) return;
  task.body = next;
  log(task, 'event', author, '내용을 고쳤습니다.');
}

export async function addChecklistItem(
  id: string,
  text: string,
  owner: string,
): Promise<void> {
  const task = find(id);
  const numbers = task.checklist.map((item) => Number(item.id.slice(1)) || 0);
  task.checklist.push({
    id: `c${Math.max(0, ...numbers) + 1}`,
    text: text.trim(),
    owner,
    done: false,
  });
}
