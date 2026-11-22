import styled from 'styled-components';
import { Chip } from '../../dimi-ui-kit/index.ts';

const Root = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[200]};
`;

export interface FilterChipItem<T extends string> {
  value: T;
  label: string;
}

export interface FilterChipsProps<T extends string> {
  items: FilterChipItem<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
  className?: string;
}

/**
 * 목록 위 상태 필터 (전체 · 검토 중 · 추진 중 …).
 * 고른 칩은 kit Chip Solid(파랑), 나머지는 Outlined로 그린다 (Figma 상태 필터).
 */
export function FilterChips<T extends string>({
  items,
  value,
  onChange,
  className,
  'aria-label': ariaLabel,
}: FilterChipsProps<T>) {
  return (
    <Root role="group" aria-label={ariaLabel} className={className}>
      {items.map((item) => {
        const on = item.value === value;
        return (
          <Chip
            key={item.value}
            theme={on ? 'solid' : 'outlined'}
            aria-pressed={on}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </Chip>
        );
      })}
    </Root>
  );
}
