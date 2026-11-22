import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { vi } from 'vitest';
import { TasksController } from '../src/tasks/controllers/index.ts';
import { TasksService } from '../src/tasks/providers/index.ts';
import { bearerTokens, createApp, ids } from './e2e-helpers.ts';

describe('task routes (e2e)', () => {
  let app: INestApplication<App>;
  let tokens: Awaited<ReturnType<typeof bearerTokens>>;
  const tasks = {
    list: vi
      .fn()
      .mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 100 }),
    get: vi.fn().mockResolvedValue({ id: 3 }),
    create: vi.fn().mockResolvedValue({ id: 3 }),
    update: vi.fn().mockResolvedValue({ id: 3 }),
    addLog: vi.fn().mockResolvedValue({ id: 3 }),
    remove: vi.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    tokens = await bearerTokens();
    app = await createApp(
      [TasksController],
      [{ provide: TasksService, useValue: tasks }],
    );
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('hides every task route from students', async () => {
    for (const [method, path] of [
      ['get', '/tasks'],
      ['get', '/tasks/3'],
      ['post', '/tasks'],
      ['patch', '/tasks/3'],
      ['post', '/tasks/3/logs'],
      ['delete', '/tasks/3'],
    ] as const)
      await request(app.getHttpServer())
        [method](path)
        .set('Authorization', tokens.student)
        .expect(403);
  });

  it('lists the board and my tasks', async () => {
    await request(app.getHttpServer())
      .get('/tasks?mine=true&pageSize=100')
      .set('Authorization', tokens.council)
      .expect(200);
    expect(tasks.list).toHaveBeenCalledWith(
      expect.objectContaining({ id: ids.council }),
      { mine: true, page: 1, pageSize: 100 },
    );
  });

  it('validates new tasks, edits and records', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', tokens.council)
      .send({ title: '포스터', dueAt: '11/25' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', tokens.council)
      .send({ title: '포스터', dueAt: '2026-11-25', activityId: 25 })
      .expect(201);
    expect(tasks.create).toHaveBeenCalledWith(expect.anything(), {
      title: '포스터',
      dueAt: '2026-11-25',
      activityId: 25,
      status: '예정됨',
    });
    await request(app.getHttpServer())
      .patch('/tasks/3')
      .set('Authorization', tokens.council)
      .send({ dueAt: '2026-11-27' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/tasks/3/logs')
      .set('Authorization', tokens.council)
      .send({ text: '시안 완료', status: '보류' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/tasks/3/logs')
      .set('Authorization', tokens.council)
      .send({ text: '시안 완료', status: '검토 요청' })
      .expect(201);
    expect(tasks.addLog).toHaveBeenCalledWith(expect.anything(), 3, {
      text: '시안 완료',
      status: '검토 요청',
    });
  });
});
