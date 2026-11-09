/**
 * 로그인 연동 전 임시 세션.
 * TODO: 디미고 계정 로그인(백엔드) 연동 후 실제 사용자 정보로 교체한다.
 */
export interface Session {
  name: string;
  /** 학생 화면 오른쪽 위에 보이는 소속 (예: 2학년 3반) */
  affiliation: string;
  /** 업무공간 아래쪽에 보이는 학생회 직책. 없으면 학생회 구성원이 아니다. */
  councilRole?: string;
}

const devSession: Session = {
  name: '김하린',
  affiliation: '2학년 3반',
  councilRole: '회장단',
};

export function useSession(): Session {
  return devSession;
}
