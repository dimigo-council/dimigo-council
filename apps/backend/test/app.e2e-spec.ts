import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { vi } from 'vitest';
import { AppModule } from './../src/app.module.ts';
import { DatabaseService } from './../src/db/database.service.ts';
import { requests } from './../src/db/schema/index.ts';
import { configureCors } from './../src/cors.ts';
import { configureRequestLogging } from './../src/request-logging.ts';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let insert: ReturnType<typeof vi.fn>;
  let values: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    values = vi.fn().mockResolvedValue(undefined);
    insert = vi.fn().mockReturnValue({ values });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({ db: { insert } })
      .compile();

    app = moduleFixture.createNestApplication();
    configureRequestLogging(app);
    configureCors(app, 'https://frontend.example.test');
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('logs Dimion-style request details to the console and database', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    await request(app.getHttpServer())
      .get('/?token=secret')
      .set('User-Agent', 'logger-test')
      .set('X-Forwarded-For', '203.0.113.10, 192.0.2.1')
      .expect(200);

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        /^From 203\.0\.113\.10 >  192\.0\.2\.1 through .+ \(logger-test\) - Requested "GET \/ HTTP\/1\.1" \| Responded with HTTP 200 by uid\{unknown\} \+\d+ms$/,
      ),
    );
    expect(insert).toHaveBeenCalledWith(requests);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: expect.any(String),
        userAgent: 'logger-test',
        reqMethod: 'GET',
        originURL: '/',
        httpVersion: 'HTTP/1.1',
        statusCode: 200,
        authorization: 'unknown',
        durationMs: expect.any(Number),
      }),
    );
    expect(log.mock.calls.flat().join(' ')).not.toContain('secret');
    expect(JSON.stringify(values.mock.calls)).not.toContain('secret');
  });

  it('reports database logging failures without failing the request', async () => {
    const error = new Error('database unavailable');
    values.mockRejectedValueOnce(error);
    const logError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    await request(app.getHttpServer()).get('/').expect(200);

    expect(logError).toHaveBeenCalledWith('Failed to log request to DB', error);
  });

  it('allows credentialed preflight requests from the configured frontend only', async () => {
    await request(app.getHttpServer())
      .options('/')
      .set('Origin', 'https://frontend.example.test')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'https://frontend.example.test')
      .expect('Access-Control-Allow-Credentials', 'true');

    const otherOrigin = await request(app.getHttpServer())
      .options('/')
      .set('Origin', 'https://other.example.test')
      .set('Access-Control-Request-Method', 'GET')
      .expect(404);
    expect(otherOrigin.headers['access-control-allow-origin']).toBeUndefined();
  });

  afterEach(async () => {
    await app.close();
    vi.restoreAllMocks();
  });
});
