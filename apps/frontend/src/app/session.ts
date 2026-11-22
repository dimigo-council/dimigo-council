/**
 * 로그인 연동 전 임시 세션.
 * TODO: 디미고 계정 로그인(백엔드) 연동 후 실제 사용자 정보로 교체한다.
 */
export interface Session {
  name: string;
  /** 학생 화면 오른쪽 위에 보이는 소속 (예: 2학년 5반) */
  affiliation: string;
  /** 학생회 화면 오른쪽 위에 보이는 직책 (예: IT부 부장). 없으면 학생회 임원이 아니다. */
  councilRole?: string;
  /** 학생회 소속 부서 */
  department?: string;
}

const devSession: Session = {
  name: '김호태',
  affiliation: '2학년 5반',
  councilRole: '환경예술부 부장',
  department: '환경예술부',
};

/** 로더처럼 컴포넌트 밖에서 쓸 때 */
export function getSession(): Session {
  return devSession;
}

export function useSession(): Session {
  return getSession();
}
