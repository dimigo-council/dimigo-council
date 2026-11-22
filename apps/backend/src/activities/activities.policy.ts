import { isCouncil, type Viewer } from '#/common/viewer';
import type { ActivityScope, ActivityStatus } from '#/db/schema/index';

/** 공개 범위: 전체 공개 activities are visible to everyone, 학생회 ones only to council members. */
export function canViewActivity(
  viewer: Pick<Viewer, 'permissions'> | null,
  scope: ActivityScope,
): boolean {
  return scope === '전체 공개' || (viewer !== null && isCouncil(viewer));
}

/**
 * AGD-U1: only the 담당자 changes the 공개 범위. When an activity has no
 * 담당자 (for example, the owner's account was deleted), any council member can.
 */
export function canChangeActivityScope(
  viewer: Pick<Viewer, 'id' | 'permissions'>,
  ownerId: string | null,
): boolean {
  return isCouncil(viewer) && (ownerId === null || ownerId === viewer.id);
}

/** Keeps the time the activity became 완료, for the home "이번 달 완료" count. */
export function completedAtFor(
  previous: { status: ActivityStatus; completedAt: Date | null },
  next: ActivityStatus,
  now: Date = new Date(),
): Date | null {
  if (next !== '완료') return null;
  return previous.status === '완료' ? previous.completedAt : now;
}
