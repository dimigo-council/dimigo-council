import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.ts';
import { DatabaseService } from './../src/db/database.service.ts';
import { configureCors } from './../src/cors.ts';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    configureCors(app, 'https://frontend.example.test');
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
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
  });
});
