import { ChevronLeftIcon } from '../../app/icons.tsx';

/** 문항·응답을 하나씩 앞뒤로 넘기는 화살표 버튼. 다음 버튼은 같은 아이콘을 뒤집어 쓴다. */
export function StepButton({
  direction,
  label,
  onClick,
}: {
  direction: 'previous' | 'next';
  label: string;
  onClick: () => void;
}) {
  const className =
    direction === 'next' ? 'icon-button result-question__next' : 'icon-button';
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={onClick}
    >
      <ChevronLeftIcon />
    </button>
  );
}

/** 처음에서 뒤로 가면 마지막으로, 마지막에서 앞으로 가면 처음으로 돌아간다. */
export function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}
