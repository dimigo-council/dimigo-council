import { BadRequestException } from '@nestjs/common';
import { Permission } from '#/db/schema/index';
import { mockDatabase } from '../../../test/mock-db.ts';
import { MembersService, toMember } from './members.service.ts';

const userId = '00000000-0000-0000-0000-000000000002';

function memberRow(overrides: Record<string, unknown> = {}) {
  return {
    id: userId,
    name: '안지호',
    email: 'jiho@dimigo.hs.kr',
    pictureUrl: null,
    grade: 1,
    class: 5,
    permissions: Permission.isStudentCouncil,
    departmentId: 5,
    departmentName: 'IT부',
    role: 'member',
    position: '부원',
    ...overrides,
  };
}

describe('toMember', () => {
  it('maps permissions and roles to the frontend labels', () => {
    expect(toMember(memberRow() as never).permission).toBe('일반');
    expect(toMember(memberRow({ role: 'head' }) as never).permission).toBe(
      '부서 관리',
    );
    expect(
      toMember(
        memberRow({
          permissions: Permission.isAdmin | Permission.isStudentCouncil,
        }) as never,
      ),
    ).toMatchObject({
      permission: '관리자',
      isAdmin: true,
      isStudentCouncil: true,
    });
    expect(
      toMember(memberRow({ departmentId: null, departmentName: null }) as never)
        .department,
    ).toBeNull();
  });
});

describe('MembersService', () => {
  it('assigns departments only to council members', async () => {
    const mock = mockDatabase().on('select', 'users', [
      memberRow({ permissions: 0, departmentId: null, departmentName: null }),
    ]);
    await expect(
      new MembersService(mock.database).assignDepartment(userId, {
        departmentId: 5,
        role: 'member',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mock.queries('insert')).toHaveLength(0);
  });

  it('removes the department membership when the council bit is revoked', async () => {
    const mock = mockDatabase()
      .on('update', 'users', [{ id: userId }])
      .on('delete', 'department_members', [])
      .on('select', 'users', [
        memberRow({ permissions: 0, departmentId: null, departmentName: null }),
      ]);
    const member = await new MembersService(mock.database).setCouncil(
      userId,
      false,
    );
    expect(member.isStudentCouncil).toBe(false);
    expect(mock.queries('delete', 'department_members')).toHaveLength(1);
  });

  it('keeps the membership when the council bit is granted', async () => {
    const mock = mockDatabase()
      .on('update', 'users', [{ id: userId }])
      .on('select', 'users', [memberRow()]);
    await new MembersService(mock.database).setCouncil(userId, true);
    expect(mock.queries('delete')).toHaveLength(0);
  });
});
