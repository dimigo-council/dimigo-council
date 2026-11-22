import { BadRequestException } from '@nestjs/common';
import { vi } from 'vitest';
import { Permission } from '#/db/schema/index';
import { mockDatabase } from '../../../test/mock-db.ts';
import { TasksService } from './tasks.service.ts';

const viewer = {
  id: '00000000-0000-0000-0000-000000000001',
  name: '이서연',
  permissions: Permission.isStudentCouncil,
  grade: 2,
  class: 2,
};
const assigneeId = '00000000-0000-0000-0000-000000000002';

function taskRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 3,
    title: '포스터 만들기',
    tag: null,
    activityId: 25,
    assignerId: viewer.id,
    departmentId: null,
    assigneeId,
    startAt: '2026-11-21',
    dueAt: '2026-11-25',
    status: '예정됨',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function withDetail(mock: ReturnType<typeof mockDatabase>, row = taskRow()) {
  return mock
    .on('select', 'tasks', [row])
    .on('select', 'users', [
      { id: viewer.id, name: '이서연' },
      { id: assigneeId, name: '안지호' },
    ])
    .on('select', 'activities', [{ id: 25, title: '수능 응원' }])
    .on('select', 'task_logs', []);
}

describe('TasksService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts today in Seoul by default and logs the assignment to the activity', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    // 2026-11-20 16:00 UTC is 2026-11-21 01:00 in Seoul.
    vi.setSystemTime(new Date('2026-11-20T16:00:00Z'));
    const mock = withDetail(
      mockDatabase()
        .on('select', 'users', [
          { name: '안지호', permissions: Permission.isStudentCouncil },
        ])
        .on('insert', 'tasks', [taskRow()])
        .on('insert', 'task_logs', [])
        .on('update', 'tasks', [])
        .on('insert', 'activity_histories', []),
    );
    const task = await new TasksService(mock.database).create(viewer, {
      title: '포스터 만들기',
      activityId: 25,
      assigneeId,
      dueAt: '2026-11-25',
      status: '예정됨',
    });

    expect(mock.queries('insert', 'tasks')[0].arg('values')).toMatchObject({
      startAt: '2026-11-21',
      assignerId: viewer.id,
      assigneeId,
    });
    expect(mock.queries('insert', 'task_logs')[0].arg('values')).toMatchObject({
      kind: '배정',
      text: '이서연이 안지호에게 업무를 배정했어요.',
      status: '예정됨',
    });
    expect(
      mock.queries('insert', 'activity_histories')[0].arg('values'),
    ).toMatchObject({ activityId: 25, kind: '추진', taskId: 3 });
    expect(task).toMatchObject({
      activity: { id: 25, title: '수능 응원' },
      assignee: { id: assigneeId, name: '안지호' },
    });
  });

  it('rejects a due date before the start date and non-council assignees', async () => {
    await expect(
      new TasksService(mockDatabase().database).create(viewer, {
        title: '업무',
        startAt: '2026-11-25',
        dueAt: '2026-11-20',
        status: '예정됨',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    const mock = mockDatabase().on('select', 'users', [
      { name: '학생', permissions: 0 },
    ]);
    await expect(
      new TasksService(mock.database).create(viewer, {
        title: '업무',
        assigneeId,
        dueAt: '2099-01-01',
        status: '예정됨',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('makes a recorded status the current status', async () => {
    const mock = withDetail(
      mockDatabase()
        .on('select', 'tasks', [taskRow()])
        .on('insert', 'task_logs', [])
        .on('update', 'tasks', [])
        .on('insert', 'activity_histories', []),
    );
    await new TasksService(mock.database).addLog(viewer, 3, {
      text: '시안을 올렸어요.',
      status: '검토 요청',
    });
    expect(mock.queries('insert', 'task_logs')[0].arg('values')).toMatchObject({
      kind: '진행 중',
      status: '검토 요청',
    });
    expect(mock.queries('update', 'tasks')[0].arg('set')).toEqual({
      status: '검토 요청',
    });
  });

  it('writes edits to the 진행 기록', async () => {
    const mock = withDetail(
      mockDatabase()
        .on('select', 'tasks', [taskRow({ activityId: null })])
        .on('update', 'tasks', [])
        .on('insert', 'task_logs', []),
      taskRow({ activityId: null }),
    );
    await new TasksService(mock.database).update(viewer, 3, {
      title: '포스터 다시 만들기',
      dueAt: '2026-11-27',
    });
    expect(mock.queries('insert', 'task_logs')[0].arg('values')).toMatchObject({
      kind: '수정',
      text: '이서연이 제목을, 마감일을 2026-11-25에서 2026-11-27로 바꿨어요.',
      status: null,
    });
    expect(mock.queries('insert', 'activity_histories')).toHaveLength(0);
  });
});
