import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { ActivitiesService } from '#/activities/providers/activities.service';
import { Permission } from '#/db/schema/index';
import { mockDatabase } from '../../../test/mock-db.ts';
import {
  InquiriesService,
  toInquiryView,
  type InquiryRow,
} from './inquiries.service.ts';

const AUTHOR_ID = '00000000-0000-0000-0000-00000000a001';
const author = {
  id: AUTHOR_ID,
  name: '김호태',
  permissions: 0,
  grade: 2,
  class: 5,
};
const other = {
  id: 'other',
  name: '이하준',
  permissions: 0,
  grade: 1,
  class: 2,
};
const council = {
  id: 'council',
  name: '이서연',
  permissions: Permission.isStudentCouncil,
  grade: 2,
  class: 2,
};

function row(overrides: Partial<InquiryRow> = {}): InquiryRow {
  return {
    id: 131,
    title: '화장실 문 수리',
    body: '문이 잘 잠기지 않아요.',
    scope: '전체 공개',
    anonymous: false,
    authorId: AUTHOR_ID,
    authorName: '김호태',
    authorGrade: 2,
    authorClass: 5,
    status: '접수',
    departmentId: null,
    answerBody: null,
    answerDepartmentId: null,
    answeredAt: null,
    rejectReason: null,
    rejectedAt: null,
    completedAt: null,
    activityId: null,
    activityTitle: null,
    activityScope: null,
    createdAt: new Date('2026-11-06T00:00:00Z'),
    likes: 3,
    liked: false,
    ...overrides,
  };
}

describe('toInquiryView anonymity', () => {
  const anonymous = row({ anonymous: true });

  it('never shows an anonymous author to the council or other students', () => {
    for (const viewer of [council, other]) {
      const view = toInquiryView(anonymous, viewer, new Map());
      expect(view.author).toBeNull();
      expect(view.authorClass).toBeNull();
      expect(JSON.stringify(view)).not.toContain('김호태');
      expect(JSON.stringify(view)).not.toContain(AUTHOR_ID);
      expect(JSON.stringify(view)).not.toContain('2학년 5반');
    }
  });

  it('shows the author their own anonymous inquiry', () => {
    const view = toInquiryView(anonymous, author, new Map());
    expect(view).toMatchObject({
      author: '김호태',
      authorClass: '2학년 5반',
      mine: true,
    });
  });

  it('shows named authors of public inquiries', () => {
    expect(toInquiryView(row(), other, new Map())).toMatchObject({
      author: '김호태',
      authorClass: '2학년 5반',
      mine: false,
    });
  });

  it('shows the answer and reason only to the author and the council', () => {
    const answered = row({
      status: '반려',
      answerBody: '답변',
      answeredAt: new Date(),
      rejectReason: '사유',
      rejectedAt: new Date(),
    });
    expect(toInquiryView(answered, other, new Map())).toMatchObject({
      answer: null,
      rejectReason: null,
    });
    expect(toInquiryView(answered, author, new Map())).toMatchObject({
      answer: { body: '답변' },
      rejectReason: '사유',
    });
    expect(toInquiryView(answered, council, new Map())).toMatchObject({
      answer: { body: '답변' },
      rejectReason: '사유',
    });
  });

  it('hides a 학생회 activity link from students', () => {
    const linked = row({
      activityId: 24,
      activityTitle: '디미체전',
      activityScope: '학생회',
    });
    expect(toInquiryView(linked, other, new Map()).activity).toBeNull();
    expect(toInquiryView(linked, council, new Map()).activity).toEqual({
      id: 24,
      title: '디미체전',
    });
  });
});

describe('InquiriesService', () => {
  const activities = {} as ActivitiesService;
  const dialect = new PgDialect();

  it('blanks anonymous author columns in SQL for viewers who did not write them', async () => {
    const mock = mockDatabase().on('select', 'inquiries', [row()]);
    await new InquiriesService(mock.database, activities).get(council, 131);
    const [, [fields]] = mock.queries('select', 'inquiries')[0].calls[0] as [
      string,
      [Record<string, SQL>],
    ];
    for (const column of ['authorName', 'authorGrade', 'authorClass']) {
      const query = dialect.sqlToQuery(fields[column]);
      expect(query.sql).toMatch(
        /^CASE WHEN "inquiries"\."anonymous" AND "inquiries"\."author_id" <> \$1 THEN NULL ELSE/,
      );
      expect(query.params).toEqual([council.id]);
    }
  });

  it('hides 학생회만 inquiries from other students', async () => {
    const mock = mockDatabase().on('select', 'inquiries', [
      row({ scope: '학생회만' }),
    ]);
    await expect(
      new InquiriesService(mock.database, activities).get(other, 131),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lets only the author change the scope and clears 익명 for 학생회만', async () => {
    const forbidden = mockDatabase().on('select', 'inquiries', [row()]);
    await expect(
      new InquiriesService(forbidden.database, activities).setScope(
        council,
        131,
        { scope: '학생회만', anonymous: false },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const mock = mockDatabase()
      .on('select', 'inquiries', [row({ anonymous: true })])
      .on('update', 'inquiries', [])
      .on('select', 'inquiries', [row({ scope: '학생회만' })]);
    await new InquiriesService(mock.database, activities).setScope(
      author,
      131,
      {
        scope: '학생회만',
        anonymous: true,
      },
    );
    expect(mock.queries('update', 'inquiries')[0].arg('set')).toEqual({
      scope: '학생회만',
      anonymous: false,
    });
  });

  it('writes an answer and moves 접수 to 답변 완료', async () => {
    const mock = mockDatabase()
      .on('select', 'inquiries', [row()])
      .on('update', 'inquiries', [{ id: 131 }])
      .on('select', 'inquiries', [row({ status: '답변 완료' })]);
    await new InquiriesService(mock.database, activities).answer(council, 131, {
      status: '답변 완료',
      body: '확인했어요.',
    });
    expect(mock.queries('update', 'inquiries')[0].arg('set')).toMatchObject({
      status: '답변 완료',
      answerBody: '확인했어요.',
      answeredAt: expect.any(Date),
    });
  });

  it('enforces the 처리 흐름', async () => {
    const service = (current: Partial<InquiryRow>) =>
      new InquiriesService(
        mockDatabase().on('select', 'inquiries', [row(current)]).database,
        activities,
      );
    await expect(
      service({}).answer(council, 131, { status: '반려' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service({}).answer(council, 131, { status: '처리 완료' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service({ status: '처리 완료' }).answer(council, 131, {
        status: '반려',
        body: '사유',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      service({ status: '반려' }).answer(council, 131, {
        status: '답변 완료',
        body: '다시',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('records a rejection reason apart from the answer', async () => {
    const mock = mockDatabase()
      .on('select', 'inquiries', [
        row({
          status: '답변 완료',
          answerBody: '답변',
          answeredAt: new Date(),
        }),
      ])
      .on('update', 'inquiries', [{ id: 131 }])
      .on('select', 'inquiries', [row({ status: '반려' })]);
    await new InquiriesService(mock.database, activities).answer(council, 131, {
      status: '반려',
      body: '예산이 없어요.',
    });
    const set = mock.queries('update', 'inquiries')[0].arg('set');
    expect(set).toMatchObject({
      status: '반려',
      rejectReason: '예산이 없어요.',
    });
    expect(set).not.toHaveProperty('answerBody');
  });

  it('toggles 공감 only on 전체 공개 inquiries', async () => {
    const closed = mockDatabase().on('select', 'inquiries', [
      row({ scope: '학생회만' }),
    ]);
    await expect(
      new InquiriesService(closed.database, activities).toggleLike(author, 131),
    ).rejects.toBeInstanceOf(BadRequestException);

    const mock = mockDatabase()
      .on('select', 'inquiries', [row()])
      .on('delete', 'inquiry_likes', [])
      .on('insert', 'inquiry_likes', [])
      .on('select', 'inquiry_likes', [{ likes: 4 }]);
    await expect(
      new InquiriesService(mock.database, activities).toggleLike(other, 131),
    ).resolves.toEqual({ liked: true, likes: 4 });

    const unlike = mockDatabase()
      .on('select', 'inquiries', [row({ liked: true })])
      .on('delete', 'inquiry_likes', [{ inquiryId: 131 }])
      .on('select', 'inquiry_likes', [{ likes: 3 }]);
    await expect(
      new InquiriesService(unlike.database, activities).toggleLike(other, 131),
    ).resolves.toEqual({ liked: false, likes: 3 });
  });
});
