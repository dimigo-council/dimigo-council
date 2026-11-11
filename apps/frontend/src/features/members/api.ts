import { mockMembers } from './mockData.ts';
import type { Member, MemberPermission } from './types.ts';

/**
 * 구성원 API.
 * TODO: 백엔드 구성원 API가 생기면 아래 함수 본문만 fetch 호출로 바꾼다. 화면은 이 함수들만 쓴다.
 * 지금은 메모리에만 저장하므로 새로고침하면 처음 상태로 돌아간다.
 */
export const isMockApi = true;

const members = structuredClone(mockMembers);

export async function listMembers(): Promise<Member[]> {
  return structuredClone(members);
}

export async function updatePermission(
  id: string,
  permission: MemberPermission,
): Promise<void> {
  const member = members.find((item) => item.id === id);
  if (!member) {
    throw new Response('구성원을 찾을 수 없습니다.', { status: 404 });
  }
  member.permission = permission;
}
