import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { vi } from 'vitest';
import {
  AdminUsersController,
  DepartmentsController,
  MembersController,
} from '../src/members/controllers/index.ts';
import {
  DepartmentsService,
  MembersService,
} from '../src/members/providers/index.ts';
import { bearerTokens, createApp, ids } from './e2e-helpers.ts';

describe('members and departments routes (e2e)', () => {
  let app: INestApplication<App>;
  let tokens: Awaited<ReturnType<typeof bearerTokens>>;
  const departments = {
    list: vi.fn().mockResolvedValue([{ id: 1, name: 'IT부' }]),
    create: vi.fn().mockResolvedValue({ id: 2, name: '홍보부' }),
    rename: vi.fn().mockResolvedValue({ id: 2, name: '홍보·기록부' }),
    remove: vi.fn().mockResolvedValue(undefined),
  };
  const page = { items: [], total: 0, page: 1, pageSize: 20 };
  const members = {
    listMembers: vi.fn().mockResolvedValue(page),
    listAllUsers: vi.fn().mockResolvedValue(page),
    assignDepartment: vi.fn().mockResolvedValue({ id: ids.student }),
    removeFromDepartment: vi.fn().mockResolvedValue({ id: ids.student }),
    setCouncil: vi.fn().mockResolvedValue({ id: ids.student }),
  };

  beforeAll(async () => {
    tokens = await bearerTokens();
    app = await createApp(
      [DepartmentsController, MembersController, AdminUsersController],
      [
        { provide: DepartmentsService, useValue: departments },
        { provide: MembersService, useValue: members },
      ],
    );
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('lets any signed-in user read departments', async () => {
    await request(app.getHttpServer()).get('/departments').expect(401);
    await request(app.getHttpServer())
      .get('/departments')
      .set('Authorization', tokens.pending)
      .expect(403);
    const response = await request(app.getHttpServer())
      .get('/departments')
      .set('Authorization', tokens.student)
      .expect(200);
    expect(response.body).toEqual([{ id: 1, name: 'IT부' }]);
  });

  it('limits department changes to admins', async () => {
    await request(app.getHttpServer())
      .post('/departments')
      .set('Authorization', tokens.council)
      .send({ name: '홍보부' })
      .expect(403);
    await request(app.getHttpServer())
      .post('/departments')
      .set('Authorization', tokens.admin)
      .send({ name: ' ' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/departments')
      .set('Authorization', tokens.admin)
      .send({ name: '홍보부' })
      .expect(201);
    await request(app.getHttpServer())
      .patch('/departments/2')
      .set('Authorization', tokens.admin)
      .send({ name: '홍보·기록부' })
      .expect(200);
    expect(departments.rename).toHaveBeenCalledWith(2, '홍보·기록부');
    await request(app.getHttpServer())
      .delete('/departments/2')
      .set('Authorization', tokens.admin)
      .expect(204);
  });

  it('lists members for the council only', async () => {
    await request(app.getHttpServer())
      .get('/members')
      .set('Authorization', tokens.student)
      .expect(403);
    await request(app.getHttpServer())
      .get('/members?departmentId=1&pageSize=50')
      .set('Authorization', tokens.council)
      .expect(200);
    expect(members.listMembers).toHaveBeenCalledWith({
      departmentId: 1,
      page: 1,
      pageSize: 50,
    });
    await request(app.getHttpServer())
      .get('/members?pageSize=500')
      .set('Authorization', tokens.council)
      .expect(400);
  });

  it('lets admins manage council membership', async () => {
    await request(app.getHttpServer())
      .get('/admin/users?search=kim')
      .set('Authorization', tokens.council)
      .expect(403);
    await request(app.getHttpServer())
      .get('/admin/users?search=kim')
      .set('Authorization', tokens.admin)
      .expect(200);
    await request(app.getHttpServer())
      .get('/admin/users?council=true&pageSize=100')
      .set('Authorization', tokens.admin)
      .expect(200);
    expect(members.listAllUsers).toHaveBeenLastCalledWith({
      council: true,
      page: 1,
      pageSize: 100,
    });
    await request(app.getHttpServer())
      .get('/admin/users?council=yes')
      .set('Authorization', tokens.admin)
      .expect(400);
    await request(app.getHttpServer())
      .put(`/members/${ids.student}/council`)
      .set('Authorization', tokens.admin)
      .send({ isStudentCouncil: true })
      .expect(200);
    expect(members.setCouncil).toHaveBeenCalledWith(ids.student, true);
    await request(app.getHttpServer())
      .put(`/members/${ids.student}/department`)
      .set('Authorization', tokens.admin)
      .send({ departmentId: 1, role: 'head', position: '부장' })
      .expect(200);
    expect(members.assignDepartment).toHaveBeenCalledWith(ids.student, {
      departmentId: 1,
      role: 'head',
      position: '부장',
    });
    await request(app.getHttpServer())
      .put(`/members/${ids.student}/department`)
      .set('Authorization', tokens.admin)
      .send({ departmentId: 1, role: 'owner' })
      .expect(400);
    await request(app.getHttpServer())
      .delete('/members/not-a-uuid/department')
      .set('Authorization', tokens.admin)
      .expect(400);
  });
});
