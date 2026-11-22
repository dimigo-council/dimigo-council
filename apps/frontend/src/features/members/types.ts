/** 학생회 부서 이름. 부서 목록은 서버(/departments)에서 받는다. 부서가 없으면 빈 문자열이다. */
export type Department = string;

export interface DepartmentRef {
  id: number;
  name: string;
}

/** 학생회 화면 권한. 관리자: 모든 화면과 권한 관리, 부서 관리: 부서의 활동·업무·설문, 일반: 맡은 일 */
export const memberPermissions = ['관리자', '부서 관리', '일반'] as const;
export type MemberPermission = (typeof memberPermissions)[number];

export interface Member {
  /** 사용자 id. 담당자·배정자를 고를 때 이 값을 보낸다. */
  id: string;
  name: string;
  /** 예: 2학년 3반 */
  classLabel: string;
  department: Department;
  departmentId?: number;
  /** 회장, 부회장, 부장, 부원 등. 따로 정한 직책이 없으면 부장·부원으로 보인다. */
  position: string;
  /** 따로 정한 직책 (없으면 undefined) */
  customPosition?: string;
  permission: MemberPermission;
}
