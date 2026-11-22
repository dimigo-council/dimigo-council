import { ConflictException, ForbiddenException } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import { Permission } from '#/db/schema/index';
import { mockDatabase } from '../../../test/mock-db.ts';
import { ActivitiesService } from './activities.service.ts';

const dialect = new PgDialect();
const student = {
  id: 'student',
  name: '학생',
  permissions: 0,
  grade: 1,
  class: 1,
};
const council = {
  id: '00000000-0000-0000-0000-000000000001',
  name: '정민준',
  permissions: Permission.isStudentCouncil,
  grade: 2,
  class: 4,
};

function activityRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 27,
    title: '택배 보관함 수령 시간 확대',
    description: '',
    status: '검토 중',
    scope: '전체 공개',
    departmentId: null,
    ownerId: 'owner',
    createdById: null,
    plan: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function whereOf(mock: ReturnType<typeof mockDatabase>, table: string) {
  const where = mock.queries('select', table)[0].arg('where') as SQL;
  return dialect.sqlToQuery(where);
}

describe('ActivitiesService', () => {
  it('lists only 전체 공개 activities for students', async () => {
    const mock = mockDatabase()
      .on('select', 'activities', [])
      .on('select', 'activities', [{ total: 0 }]);
    await new ActivitiesService(mock.database).list(student, {
      page: 1,
      pageSize: 20,
    });
    const query = whereOf(mock, 'activities');
    expect(query.sql).toContain('"activities"."scope" = $1');
    expect(query.params).toEqual(['전체 공개']);
  });

  it('applies no scope filter for the council and can leave out 보류', async () => {
    const mock = mockDatabase()
      .on('select', 'activities', [])
      .on('select', 'activities', [{ total: 0 }]);
    await new ActivitiesService(mock.database).list(council, {
      page: 1,
      pageSize: 20,
      hideOnHold: true,
    });
    const query = whereOf(mock, 'activities');
    expect(query.sql).not.toContain('"scope"');
    expect(query.params).toEqual(['보류']);
  });

  it('shows the landing page public, non-보류 activities without 담당자 names', async () => {
    const mock = mockDatabase()
      .on('select', 'activities', [activityRow()])
      .on('select', 'activities', [{ total: 1 }])
      .on('select', 'inquiries', [])
      .on('select', 'surveys', []);
    const page = await new ActivitiesService(mock.database).listForLanding({
      page: 1,
      pageSize: 4,
    });
    expect(whereOf(mock, 'activities').params).toEqual(['전체 공개', '보류']);
    expect(page.items[0].owner).toBeNull();
    expect(mock.queries('select', 'users')).toHaveLength(0);
  });

  it('lets only the 담당자 change the scope', async () => {
    const mock = mockDatabase().on('select', 'activities', [activityRow()]);
    await expect(
      new ActivitiesService(mock.database).setScope(council, 27, '학생회'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(mock.queries('update')).toHaveLength(0);
  });

  it('keeps activities that published surveys depend on', async () => {
    const mock = mockDatabase()
      .on('select', 'activities', [activityRow()])
      .on('select', 'surveys', [{ published: 1 }]);
    await expect(
      new ActivitiesService(mock.database).remove(27),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(mock.queries('delete')).toHaveLength(0);
  });

  it('links inquiries with a 질의 entry that names only the number', async () => {
    const mock = mockDatabase()
      .on('select', 'users', [{ permissions: Permission.isStudentCouncil }])
      .on('insert', 'activities', [{ id: 28 }])
      .on('insert', 'activity_histories', [])
      .on('select', 'inquiries', [{ activityId: null }])
      .on('update', 'inquiries', [])
      .on('insert', 'activity_histories', [])
      .on('delete', 'activity_drafts', []);
    await expect(
      new ActivitiesService(mock.database).create(council, {
        title: '디미체전 운영 개선',
        description: '',
        scope: '전체 공개',
        status: '검토 중',
        firstRecord: '학생 질의 접수',
        inquiryIds: [128],
      }),
    ).resolves.toBe(28);
    const [first, link] = mock
      .queries('insert', 'activity_histories')
      .map((query) => query.arg('values'));
    expect(first).toMatchObject({ kind: '질의', title: '학생 질의 접수' });
    expect(link).toMatchObject({ kind: '질의', title: '학생 질의 #128 연결' });
    expect(link).not.toHaveProperty('body');
    expect(mock.queries('update', 'inquiries')[0].arg('set')).toEqual({
      activityId: 28,
    });
    expect(mock.queries('delete', 'activity_drafts')).toHaveLength(1);
  });
});
