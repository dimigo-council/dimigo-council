import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { vi } from 'vitest';
import { SurveysController } from '../src/surveys/controllers/index.ts';
import { SurveysService } from '../src/surveys/providers/index.ts';
import { bearerTokens, createApp, ids } from './e2e-helpers.ts';

describe('survey routes (e2e)', () => {
  let app: INestApplication<App>;
  let tokens: Awaited<ReturnType<typeof bearerTokens>>;
  const page = { items: [], total: 0, page: 1, pageSize: 20 };
  const surveys = {
    list: vi.fn().mockResolvedValue(page),
    latestDraft: vi.fn().mockResolvedValue(null),
    get: vi.fn().mockResolvedValue({ id: 7 }),
    create: vi.fn().mockResolvedValue({ id: 7 }),
    update: vi.fn().mockResolvedValue({ id: 7 }),
    remove: vi.fn().mockResolvedValue(undefined),
    requestReview: vi.fn().mockResolvedValue({ id: 7 }),
    publish: vi.fn().mockResolvedValue({ id: 7 }),
    unpublish: vi.fn().mockResolvedValue({ id: 7 }),
    setAccepting: vi.fn().mockResolvedValue({ id: 7 }),
    respond: vi.fn().mockResolvedValue({ myStatus: 'submitted' }),
    results: vi.fn().mockResolvedValue({ respondents: 0 }),
    listResponses: vi.fn().mockResolvedValue(page),
    setExcluded: vi.fn().mockResolvedValue(undefined),
    deleteResponse: vi.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    tokens = await bearerTokens();
    app = await createApp(
      [SurveysController],
      [{ provide: SurveysService, useValue: surveys }],
    );
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('lists and opens surveys for students', async () => {
    await request(app.getHttpServer())
      .get('/surveys?status=진행 중')
      .set('Authorization', tokens.student)
      .expect(200);
    expect(surveys.list).toHaveBeenCalledWith(
      expect.objectContaining({ id: ids.student }),
      { status: '진행 중', page: 1, pageSize: 20 },
    );
    await request(app.getHttpServer())
      .get('/surveys/7')
      .set('Authorization', tokens.student)
      .expect(200);
  });

  it('lets students and the council respond', async () => {
    for (const token of [tokens.student, tokens.council])
      await request(app.getHttpServer())
        .post('/surveys/7/responses')
        .set('Authorization', token)
        .send({ answers: { q1: '예', q2: ['A', 'B'] } })
        .expect(201);
    await request(app.getHttpServer())
      .post('/surveys/7/responses')
      .set('Authorization', tokens.student)
      .send({ answers: { q1: 3 } })
      .expect(400);
  });

  it('keeps authoring, publishing and results to the council', async () => {
    for (const [method, path] of [
      ['post', '/surveys'],
      ['patch', '/surveys/7'],
      ['post', '/surveys/7/publish'],
      ['patch', '/surveys/7/accepting'],
      ['get', '/surveys/7/results'],
      ['get', '/surveys/7/responses'],
      ['get', '/surveys/drafts/latest'],
    ] as const)
      await request(app.getHttpServer())
        [method](path)
        .set('Authorization', tokens.student)
        .expect(403);

    await request(app.getHttpServer())
      .post('/surveys')
      .set('Authorization', tokens.council)
      .send({ grades: [4] })
      .expect(400);
    await request(app.getHttpServer())
      .post('/surveys')
      .set('Authorization', tokens.council)
      .send({
        title: '급식 만족도',
        grades: [1, 2],
        questions: [
          {
            id: 'q1',
            type: 'single',
            title: '만족하나요?',
            options: ['예', '아니요'],
          },
          { id: 'q2', type: 'long', title: '의견' },
        ],
      })
      .expect(201);
    expect(surveys.create).toHaveBeenCalledWith(expect.anything(), {
      title: '급식 만족도',
      grades: [1, 2],
      questions: [
        {
          id: 'q1',
          type: 'single',
          title: '만족하나요?',
          options: ['예', '아니요'],
          required: true,
        },
        {
          id: 'q2',
          type: 'long',
          title: '의견',
          required: true,
          maxLength: 1000,
        },
      ],
    });
    await request(app.getHttpServer())
      .post('/surveys')
      .set('Authorization', tokens.council)
      .send({
        questions: [
          { id: 'q1', type: 'short', title: 'a' },
          { id: 'q1', type: 'short', title: 'b' },
        ],
      })
      .expect(400);
    await request(app.getHttpServer())
      .post('/surveys/7/publish')
      .set('Authorization', tokens.council)
      .expect(200);
    await request(app.getHttpServer())
      .patch('/surveys/7/accepting')
      .set('Authorization', tokens.council)
      .send({ accepting: false })
      .expect(200);
    expect(surveys.setAccepting).toHaveBeenCalledWith(
      expect.anything(),
      7,
      false,
    );
    await request(app.getHttpServer())
      .get('/surveys/7/results')
      .set('Authorization', tokens.council)
      .expect(200);
    await request(app.getHttpServer())
      .patch('/surveys/7/responses/not-a-uuid')
      .set('Authorization', tokens.council)
      .send({ excluded: true })
      .expect(400);
  });
});
