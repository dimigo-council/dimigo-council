import { useLocation } from 'react-router';

/** 학생회 화면(/work 아래)인지. 같은 화면 컴포넌트를 학생·학생회가 함께 쓸 때 링크와 동작을 나눈다. */
export function useIsCouncil() {
  return useLocation().pathname.startsWith('/work');
}

/** 학생회 화면이면 /work를 붙인다: base('/activities') → /work/activities */
export function useBasePath() {
  const council = useIsCouncil();
  return (path: string) => (council ? `/work${path}` : path);
}
