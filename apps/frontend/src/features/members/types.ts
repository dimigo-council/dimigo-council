/** 업무공간 권한. 관리자: 모든 화면과 공개 검토, 부서 관리: 부서의 안건·업무·설문, 일반: 맡은 일 */
export const memberPermissions = ['관리자', '부서 관리', '일반'] as const;
export type MemberPermission = (typeof memberPermissions)[number];

export interface Member {
  id: string;
  name: string;
  /** 예: 2학년 3반 */
  classLabel: string;
  department: string;
  /** 회장, 부회장, 부장, 부원 등 */
  position: string;
  permission: MemberPermission;
}
