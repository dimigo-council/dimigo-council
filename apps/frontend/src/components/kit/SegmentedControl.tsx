import { useId } from 'react';

export interface SegmentItem<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  items: SegmentItem<T>[];
  /** null이면 아무것도 고르지 않은 상태 */
  value: T | null;
  onChange: (value: T) => void;
  /** segmented: 한 틀 안의 전환. chips: 떨어진 칩 모양의 단일 선택 (건의 분류 등) */
  variant?: 'segmented' | 'chips';
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/** 한 번에 하나만 고르는 선택. 네이티브 라디오라 방향키로 움직인다. */
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  variant = 'segmented',
  name,
  ...aria
}: SegmentedControlProps<T>) {
  const generated = useId();
  const groupName = name ?? generated;

  return (
    <div
      className={
        variant === 'chips' ? 'segmented segmented--chips' : 'segmented'
      }
      role="radiogroup"
      {...aria}
    >
      {items.map((item) => (
        <label key={item.value} className="segmented__item">
          <input
            type="radio"
            className="segmented__input visually-hidden"
            name={groupName}
            value={item.value}
            checked={item.value === value}
            disabled={item.disabled}
            onChange={() => onChange(item.value)}
          />
          <span className="segmented__text">{item.label}</span>
        </label>
      ))}
    </div>
  );
}
