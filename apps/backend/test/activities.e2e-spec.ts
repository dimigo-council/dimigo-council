import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { vi } from 'vitest';
import { ActivitiesController } from '../src/activities/controllers/index.ts';
import { ActivitiesService } from '../src/activities/providers/index.ts';
import { bearerTokens, createApp, ids } from './e2e-helpers.ts';

describe('activity routes (e2e)', () => {
  let app: INestApplication<App>;
  let tokens: Awaited<ReturnType<typeof bearerTokens>>;
  const page = { items: [], total: 0, page: 1, pageSize: 20 };
  const activities = {
    list: vi.fn().mockResolvedValue(page),
    listForLanding: vi.fn().mockResolvedValue(page),
    get: vi.fn().mockResolvedValue({ id: 27 }),
    create: vi.fn().mockResolvedValue(27),
    update: vi.fn().mockResolvedValue({ id: 27 }),
    setScope: vi.fn().mockResolvedValue({ id: 27 }),
    remove: vi.fn().mockResolvedValue(undefined),
    addHistory: vi.fn().mockResolvedValue({ id: 1 }),
    deleteHistory: vi.fn().mockResolvedValue(undefined),
    getDraft: vi.fn().mockResolvedValue(null),
    saveDraft: vi.fn().mockResolvedValue({ data: {}, savedAt: new Date() }),
    deleteDraft: vi.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    tokens = await bearerTokens();
    app = await createApp(
      [ActivitiesController],
      [{ provide: ActivitiesService, useValue: activities }],
    );
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('serves the landing list without signing in', async () => {
    await request(app.getHttpServer())
      .get('/activities/landing?status=추진 중&pageSize=4')
      .expect(200);
    expect(activities.listForLanding).toHaveBeenCalledWith({
      status: '추진 중',
      page: 1,
      pageSize: 4,
    });
    await request(app.getHttpServer())
      .get('/activities/landing?status=보류')
      .expect(400);
    await request(app.getHttpServer()).get('/activities').expect(401);
  });

  it('passes the viewer and filters to the list', async () => {
    await request(app.getHttpServer())
      .get('/activities?hideOnHold=true&status=완료')
      .set('Authorization', tokens.student)
      .expect(200);
    expect(activities.list).toHaveBeenCalledWith(
      expect.objectContaining({ id: ids.student, permissions: 0 }),
      { hideOnHold: true, status: '완료', page: 1, pageSize: 20 },
    );
    await request(app.getHttpServer())
      .get('/activities/27')
      .set('Authorization', tokens.student)
      .expect(200);
  });

  it('keeps writes to the council', async () => {
    const body = { title: '새 활동', scope: '전체 공개' };
    await request(app.getHttpServer())
      .post('/activities')
      .set('Authorization', tokens.student)
      .send(body)
      .expect(403);
    await request(app.getHttpServer())
      .post('/activities')
      .set('Authorization', tokens.admin)
      .send(body)
      .expect(403);
    await request(app.getHttpServer())
      .post('/activities')
      .set('Authorization', tokens.council)
      .send({ ...body, scope: '비공개' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/activities')
      .set('Authorization', tokens.council)
      .send(body)
      .expect(201);
    expect(activities.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: ids.council }),
      {
        title: '새 활동',
        description: '',
        scope: '전체 공개',
        status: '검토 중',
        inquiryIds: [],
      },
    );
    await request(app.getHttpServer())
      .patch('/activities/27/scope')
      .set('Authorization', tokens.council)
      .send({ scope: '학생회' })
      .expect(200);
    await request(app.getHttpServer())
      .delete('/activities/27')
      .set('Authorization', tokens.council)
      .expect(204);
  });

  it('adds and deletes 추진 이력', async () => {
    await request(app.getHttpServer())
      .post('/activities/27/history')
      .set('Authorization', tokens.council)
      .send({ kind: '메모', title: '회의' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/activities/27/history')
      .set('Authorization', tokens.council)
      .send({
        kind: '회의',
        title: '11월 회의',
        at: '2026-11-08T12:00:00+09:00',
        link: { label: '회의록 보기', url: 'javascript:alert(1)' },
      })
      .expect(400);
    await request(app.getHttpServer())
      .post('/activities/27/history')
      .set('Authorization', tokens.council)
      .send({
        kind: '회의',
        title: '11월 회의',
        at: '2026-11-08T12:00:00+09:00',
        link: { label: '회의록 보기', url: '/records/r7' },
      })
      .expect(201);
    await request(app.getHttpServer())
      .delete('/activities/27/history/3')
      .set('Authorization', tokens.council)
      .expect(204);
    expect(activities.deleteHistory).toHaveBeenCalledWith(27, 3);
  });

  it('rejects ids that do not fit an integer column before querying', async () => {
    activities.get.mockClear();
    activities.list.mockClear();
    activities.create.mockClear();
    for (const id of ['2147483648', '99999999999', '0', '-1', 'abc'])
      await request(app.getHttpServer())
        .get(`/activities/${id}`)
        .set('Authorization', tokens.student)
        .expect(400);
    await request(app.getHttpServer())
      .get('/activities/2147483647')
      .set('Authorization', tokens.student)
      .expect(200);
    expect(activities.get).toHaveBeenCalledTimes(1);
    await request(app.getHttpServer())
      .get('/activities?departmentId=99999999999')
      .set('Authorization', tokens.student)
      .expect(400);
    expect(activities.list).not.toHaveBeenCalled();
    await request(app.getHttpServer())
      .post('/activities')
      .set('Authorization', tokens.council)
      .send({ title: '새 활동', scope: '전체 공개', inquiryIds: [99999999999] })
      .expect(400);
    expect(activities.create).not.toHaveBeenCalled();
  });

  it('saves and loads the 임시 저장 draft', async () => {
    await request(app.getHttpServer())
      .put('/activities/draft')
      .set('Authorization', tokens.council)
      .send({ title: '작성 중' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/activities/draft')
      .set('Authorization', tokens.council)
      .expect(200);
    await request(app.getHttpServer())
      .delete('/activities/draft')
      .set('Authorization', tokens.council)
      .expect(204);
    expect(activities.get).not.toHaveBeenCalledWith(expect.anything(), NaN);
  });
});
