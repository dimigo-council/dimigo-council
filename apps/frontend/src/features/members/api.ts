import { api, listAll } from '../../lib/api.ts';
import type { DepartmentRef, Member, MemberPermission } from './types.ts';

/** 구성원·부서 API (백엔드 /members, /departments). */

interface MemberResponse {
  id: string;
  name: string | null;
  email: string;
  grade: number | null;
  class: number | null;
  department: DepartmentRef | null;
  role: 'member' | 'head' | null;
  position: string | null;
  permission: MemberPermission;
}

function classLabel(grade: number | null, klass: number | null) {
  if (grade == null) return '';
  return klass == null ? `${grade}학년` : `${grade}학년 ${klass}반`;
}

function toMember(row: MemberResponse): Member {
  return {
    id: row.id,
    name: row.name ?? row.email.split('@')[0],
    classLabel: classLabel(row.grade, row.class),
    department: row.department?.name ?? '',
    ...(row.department && { departmentId: row.department.id }),
    position:
      row.position ??
      (row.role === 'head' ? '부장' : row.department ? '부원' : ''),
    ...(row.position && { customPosition: row.position }),
    permission: row.permission,
  };
}

/** 학생회 임원 목록 (학생회만) */
export async function listMembers(): Promise<Member[]> {
  return (await listAll<MemberResponse>('/members')).map(toMember);
}

export function listDepartments(): Promise<DepartmentRef[]> {
  return api<DepartmentRef[]>('/departments');
}

/** 부서 이름 → id. 화면은 이름으로 고르고 서버에는 id를 보낸다. 없으면 null(부서 없음). */
export async function departmentIdOf(name: string | undefined) {
  if (!name) return null;
  const found = (await listDepartments()).find((item) => item.name === name);
  return found?.id ?? null;
}

/**
 * 권한 바꾸기 (관리자만). 부서 관리는 부서장(head), 일반은 부원(member)이다.
 * 관리자 권한은 서버에서도 데이터베이스로만 줄 수 있어 화면에서 바꾸지 않는다.
 */
export async function updatePermission(
  member: Member,
  permission: Exclude<MemberPermission, '관리자'>,
): Promise<void> {
  if (member.departmentId === undefined) {
    throw new Error('부서에 속한 구성원만 권한을 바꿀 수 있어요.');
  }
  await api(`/members/${member.id}/department`, {
    method: 'PUT',
    body: {
      departmentId: member.departmentId,
      role: permission === '부서 관리' ? 'head' : 'member',
      position: member.customPosition ?? null,
    },
  });
}
