import { useId, type ReactNode } from 'react';
import './intranet.css';

export interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** <option> 목록. 첫 항목은 보통 value=""인 "전체"다. */
  children: ReactNode;
}

/** I-filter-select: 목록 위 필터 줄의 "담당 전체부서" 같은 이름표 붙은 선택 상자 */
export function FilterSelect({
  label,
  value,
  onChange,
  children,
}: FilterSelectProps) {
  const id = useId();
  return (
    <span className="filter-select">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className="field__control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </span>
  );
}
