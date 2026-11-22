/** 학생회 부서. 활동·업무·질의의 담당 부서로 쓴다. */
export const departments = [
  '회장단',
  '총무부',
  '기록부',
  '홍보부',
  'IT부',
  '생활스포츠부',
  '바른생활부',
  '문예창작부',
  '환경예술부',
] as const;
export type Department = (typeof departments)[number];

/** 학생회 화면 권한. 관리자: 모든 화면과 권한 관리, 부서 관리: 부서의 활동·업무·설문, 일반: 맡은 일 */
export const memberPermissions = ['관리자', '부서 관리', '일반'] as const;
export type MemberPermission = (typeof memberPermissions)[number];

export interface Member {
  id: string;
  name: string;
  /** 예: 2학년 3반 */
  classLabel: string;
  department: Department;
  /** 회장, 부회장, 부장, 부원 등 */
  position: string;
  permission: MemberPermission;
}
