import { Permission } from '#/db/schema/index';
import {
  canChangeActivityScope,
  canViewActivity,
  completedAtFor,
} from './activities.policy.ts';

const student = { id: 'student', permissions: 0 };
const council = { id: 'council', permissions: Permission.isStudentCouncil };
const admin = { id: 'admin', permissions: Permission.isAdmin };

describe('activity visibility', () => {
  it('shows 전체 공개 activities to everyone and 학생회 ones only to the council', () => {
    expect(canViewActivity(null, '전체 공개')).toBe(true);
    expect(canViewActivity(student, '전체 공개')).toBe(true);
    expect(canViewActivity(null, '학생회')).toBe(false);
    expect(canViewActivity(student, '학생회')).toBe(false);
    expect(canViewActivity(admin, '학생회')).toBe(false);
    expect(canViewActivity(council, '학생회')).toBe(true);
  });

  it('lets only the 담당자 change the scope', () => {
    expect(canChangeActivityScope(council, 'council')).toBe(true);
    expect(canChangeActivityScope(council, 'someone-else')).toBe(false);
    expect(canChangeActivityScope(council, null)).toBe(true);
    expect(canChangeActivityScope(student, 'student')).toBe(false);
  });
});

describe('completedAtFor', () => {
  const now = new Date('2026-11-20T00:00:00Z');
  const earlier = new Date('2026-11-01T00:00:00Z');

  it('stamps the time an activity becomes 완료 and keeps it afterwards', () => {
    expect(
      completedAtFor({ status: '추진 중', completedAt: null }, '완료', now),
    ).toBe(now);
    expect(
      completedAtFor({ status: '완료', completedAt: earlier }, '완료', now),
    ).toBe(earlier);
    expect(
      completedAtFor({ status: '완료', completedAt: earlier }, '보류', now),
    ).toBeNull();
  });
});
