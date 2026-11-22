import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { vi } from 'vitest';
import { HomeController } from '../src/home/controllers/index.ts';
import { HomeService } from '../src/home/providers/index.ts';
import { bearerTokens, createApp, ids } from './e2e-helpers.ts';

describe('home routes (e2e)', () => {
  let app: INestApplication<App>;
  let tokens: Awaited<ReturnType<typeof bearerTokens>>;
  const home = {
    student: vi.fn().mockResolvedValue({ openSurveyCount: 2 }),
    council: vi.fn().mockResolvedValue({ summary: { checkToday: 1 } }),
  };

  beforeAll(async () => {
    tokens = await bearerTokens();
    app = await createApp(
      [HomeController],
      [{ provide: HomeService, useValue: home }],
    );
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('returns the student summary to any signed-in user', async () => {
    const response = await request(app.getHttpServer())
      .get('/home/student')
      .set('Authorization', tokens.student)
      .expect(200);
    expect(response.body).toEqual({ openSurveyCount: 2 });
    expect(home.student).toHaveBeenCalledWith(
      expect.objectContaining({ id: ids.student }),
    );
  });

  it('returns the council summary to council members only', async () => {
    await request(app.getHttpServer())
      .get('/home/council')
      .set('Authorization', tokens.student)
      .expect(403);
    await request(app.getHttpServer())
      .get('/home/council')
      .set('Authorization', tokens.council)
      .expect(200);
  });
});
