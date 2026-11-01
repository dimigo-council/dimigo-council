import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ChipProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value'
> {
  /** 켜고 끄는 칩이면 지정한다. aria-pressed로 전달된다. */
  selected?: boolean;
  /** 필터 칩의 현재 값. "부서 **전체**"처럼 이름 뒤에 굵게 붙는다. */
  value?: ReactNode;
}

export function Chip({
  selected,
  value,
  type = 'button',
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      className={['chip', className].filter(Boolean).join(' ')}
      aria-pressed={selected}
      {...rest}
    >
      {children}
      {value !== undefined && <strong className="chip__value">{value}</strong>}
    </button>
  );
}
