import type { AuthUser } from '#/auth/providers/auth.service';
import { Permission } from '#/db/schema/index';

/** The signed-in user as the access token describes them. */
export type Viewer = Pick<
  AuthUser,
  'id' | 'name' | 'permissions' | 'grade' | 'class'
>;

export function isCouncil(viewer: Pick<Viewer, 'permissions'>): boolean {
  return (viewer.permissions & Permission.isStudentCouncil) !== 0;
}

export function isAdmin(viewer: Pick<Viewer, 'permissions'>): boolean {
  return (viewer.permissions & Permission.isAdmin) !== 0;
}
