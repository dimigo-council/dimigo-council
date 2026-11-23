import { api, listAll, type Page } from '../../lib/api.ts';
import type {
  DepartmentRef,
  DepartmentRole,
  ManagedUser,
  Member,
  MemberPermission,
} from './types.ts';

/** 구성원·부서 API (백엔드 /members, /departments). */

interface MemberResponse {
  id: string;
  name: string | null;
  email: string;
  grade: number | null;
  class: number | null;
  department: DepartmentRef | null;
  role: DepartmentRole | null;
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

/* ---------- 관리자 (isAdmin) ---------- */

interface ManagedUserResponse extends MemberResponse {
  isAdmin: boolean;
  isStudentCouncil: boolean;
}

function toManagedUser(row: ManagedUserResponse): ManagedUser {
  return {
    ...toMember(row),
    email: row.email,
    department: row.department,
    role: row.role,
    customPosition: row.position,
    isAdmin: row.isAdmin,
    isStudentCouncil: row.isStudentCouncil,
  };
}

/** 학생회 임원 전체. 관리자는 학생회가 아니어도 볼 수 있도록 /admin/users를 쓴다. */
export async function listCouncilUsers(): Promise<ManagedUser[]> {
  return (
    await listAll<ManagedUserResponse>('/admin/users', { council: true })
  ).map(toManagedUser);
}

/** 가입을 마친 모든 사용자 가운데 이름·이메일로 찾는다. 한 번에 100명까지. */
export async function searchUsers(
  search: string,
  signal?: AbortSignal,
): Promise<{ users: ManagedUser[]; total: number }> {
  const result = await api<Page<ManagedUserResponse>>('/admin/users', {
    query: { search: search || undefined, pageSize: 100 },
    signal,
  });
  return { users: result.items.map(toManagedUser), total: result.total };
}

export async function setCouncil(userId: string, isStudentCouncil: boolean) {
  return toManagedUser(
    await api<ManagedUserResponse>(`/members/${userId}/council`, {
      method: 'PUT',
      body: { isStudentCouncil },
    }),
  );
}

export async function assignDepartment(
  userId: string,
  membership: {
    departmentId: number;
    role: DepartmentRole;
    position: string | null;
  },
) {
  return toManagedUser(
    await api<ManagedUserResponse>(`/members/${userId}/department`, {
      method: 'PUT',
      body: membership,
    }),
  );
}

export async function removeFromDepartment(userId: string) {
  return toManagedUser(
    await api<ManagedUserResponse>(`/members/${userId}/department`, {
      method: 'DELETE',
    }),
  );
}

export function createDepartment(name: string) {
  return api<DepartmentRef>('/departments', {
    method: 'POST',
    body: { name },
  });
}

export function renameDepartment(id: number, name: string) {
  return api<DepartmentRef>(`/departments/${id}`, {
    method: 'PATCH',
    body: { name },
  });
}

export function deleteDepartment(id: number) {
  return api<void>(`/departments/${id}`, { method: 'DELETE' });
}
