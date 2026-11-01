import { useSearchParams } from 'react-router';

/**
 * 주소의 검색 매개변수 하나를 정해진 값 가운데 하나로 읽고 쓴다. (목록 화면의 탭·보기 전환)
 * 없는 값이면 기본값으로 보고, 기본값으로 바꾸면 매개변수를 지운다. 방문 기록은 쌓지 않는다.
 */
export function useSearchParamOption<T extends string>(
  key: string,
  options: readonly T[],
  fallback: T,
) {
  const [params, setParams] = useSearchParams();
  const requested = params.get(key);
  const value = options.find((option) => option === requested) ?? fallback;
  const setValue = (next: T) =>
    setParams(next === fallback ? {} : { [key]: next }, { replace: true });
  return [value, setValue] as const;
}
