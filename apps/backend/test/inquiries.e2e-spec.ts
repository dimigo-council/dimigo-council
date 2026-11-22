import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { vi } from 'vitest';
import { InquiriesController } from '../src/inquiries/controllers/index.ts';
import { InquiriesService } from '../src/inquiries/providers/index.ts';
import { bearerTokens, createApp, ids } from './e2e-helpers.ts';

describe('inquiry routes (e2e)', () => {
  let app: INestApplication<App>;
  let tokens: Awaited<ReturnType<typeof bearerTokens>>;
  const inquiries = {
    list: vi
      .fn()
      .mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 }),
    get: vi.fn().mockResolvedValue({ id: 131 }),
    create: vi.fn().mockResolvedValue({ id: 136 }),
    setScope: vi.fn().mockResolvedValue({ id: 131 }),
    toggleLike: vi.fn().mockResolvedValue({ liked: true, likes: 1 }),
    setDepartment: vi.fn().mockResolvedValue({ id: 131 }),
    answer: vi.fn().mockResolvedValue({ id: 131 }),
    linkActivity: vi.fn().mockResolvedValue({ id: 131 }),
    createActivity: vi.fn().mockResolvedValue({ id: 131 }),
    unlinkActivity: vi.fn().mockResolvedValue({ id: 131 }),
  };

  beforeAll(async () => {
    tokens = await bearerTokens();
    app = await createApp(
      [InquiriesController],
      [{ provide: InquiriesService, useValue: inquiries }],
    );
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('validates new inquiries', async () => {
    const base = { title: '와이파이', body: '저녁마다 끊겨요.' };
    await request(app.getHttpServer())
      .post('/inquiries')
      .set('Authorization', tokens.student)
      .send({ ...base, scope: '학생회만', anonymous: true })
      .expect(400);
    await request(app.getHttpServer())
      .post('/inquiries')
      .set('Authorization', tokens.student)
      .send({ ...base, body: 'a'.repeat(1001), scope: '전체 공개' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/inquiries')
      .set('Authorization', tokens.student)
      .send({ ...base, title: '', scope: '전체 공개' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/inquiries')
      .set('Authorization', tokens.student)
      .send({ ...base, scope: '전체 공개', anonymous: true })
      .expect(201);
    expect(inquiries.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: ids.student }),
      { ...base, scope: '전체 공개', anonymous: true },
    );
  });

  it('filters the 질의함 and toggles 공감', async () => {
    await request(app.getHttpServer())
      .get('/inquiries?mine=true&status=답변 완료')
      .set('Authorization', tokens.student)
      .expect(200);
    expect(inquiries.list).toHaveBeenCalledWith(expect.anything(), {
      mine: true,
      status: '답변 완료',
      page: 1,
      pageSize: 20,
    });
    const like = await request(app.getHttpServer())
      .post('/inquiries/131/like')
      .set('Authorization', tokens.student)
      .expect(200);
    expect(like.body).toEqual({ liked: true, likes: 1 });
  });

  it('lets students change their own scope but not process inquiries', async () => {
    await request(app.getHttpServer())
      .patch('/inquiries/131/scope')
      .set('Authorization', tokens.student)
      .send({ scope: '학생회만' })
      .expect(200);
    expect(inquiries.setScope).toHaveBeenCalledWith(expect.anything(), 131, {
      scope: '학생회만',
      anonymous: false,
    });
    for (const [method, path] of [
      ['post', '/inquiries/131/answer'],
      ['patch', '/inquiries/131/department'],
      ['put', '/inquiries/131/activity'],
      ['post', '/inquiries/131/activity'],
      ['delete', '/inquiries/131/activity'],
    ] as const)
      await request(app.getHttpServer())
        [method](path)
        .set('Authorization', tokens.student)
        .expect(403);
  });

  it('lets the council answer and link activities', async () => {
    await request(app.getHttpServer())
      .post('/inquiries/131/answer')
      .set('Authorization', tokens.council)
      .send({ status: '접수' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/inquiries/131/answer')
      .set('Authorization', tokens.council)
      .send({ status: '반려', body: '예산이 없어요.', departmentId: 2 })
      .expect(200);
    expect(inquiries.answer).toHaveBeenCalledWith(expect.anything(), 131, {
      status: '반려',
      body: '예산이 없어요.',
      departmentId: 2,
    });
    await request(app.getHttpServer())
      .put('/inquiries/131/activity')
      .set('Authorization', tokens.council)
      .send({ activityId: 24 })
      .expect(200);
    await request(app.getHttpServer())
      .post('/inquiries/131/activity')
      .set('Authorization', tokens.council)
      .send({ scope: '전체 공개' })
      .expect(201);
    expect(inquiries.createActivity).toHaveBeenCalledWith(
      expect.anything(),
      131,
      { scope: '전체 공개', description: '', status: '검토 중' },
    );
  });
});
