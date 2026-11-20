import { useRef, type KeyboardEvent } from 'react';
import styled, { css } from 'styled-components';
import {
  segmentSelectedStyles,
  segmentStyles,
  segmentedTrackStyles,
} from '../../dimi-ui-kit/index.ts';
import { CountText } from './misc.tsx';

/* Tabs: kit SegmentedControl 트랙. 좁은 화면에서 가로로만 스크롤된다. */
export const TabsTrack = styled.div`
  ${({ theme: t }) => segmentedTrackStyles(t)}
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/** 트랙 안의 탭 하나 (kit Segment). 링크로 쓸 때는 aria-current="page"가 선택 상태다. */
export const TabSegment = styled.button<{ $selected?: boolean }>`
  ${({ theme: t, $selected }) => css`
    ${segmentStyles(t, { selected: $selected })}
    min-width: 0;
    flex: 1 0 auto;
    font-size: ${t.font.size.callout};
    line-height: ${t.font.lineHeight.callout};
    text-decoration: none;

    &[aria-current='page'] {
      ${segmentSelectedStyles(t)}
    }
  `}
`;

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
  /** 탭 패널 id를 만들 때 쓰는 접두사. `${idPrefix}-panel-${value}` */
  idPrefix?: string;
}

/** 화면 안의 보기 전환. DIMI UI KIT SegmentedControl 모양에 탭 키보드 동작을 더했다. */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  idPrefix,
  'aria-label': ariaLabel,
}: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, step: number) => {
    for (let i = 1; i <= items.length; i++) {
      const next = (from + step * i + items.length) % items.length;
      if (!items[next].disabled) {
        onChange(items[next].value);
        refs.current[next]?.focus();
        return;
      }
    }
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(index, 1),
      ArrowLeft: () => move(index, -1),
      Home: () => move(-1, 1),
      End: () => move(items.length, -1),
    };
    const action = keys[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  return (
    <TabsTrack role="tablist" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <TabSegment
            key={item.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={idPrefix ? `${idPrefix}-tab-${item.value}` : undefined}
            aria-controls={
              idPrefix ? `${idPrefix}-panel-${item.value}` : undefined
            }
            aria-selected={selected}
            $selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.label}
            {item.count !== undefined && <CountText>{item.count}</CountText>}
          </TabSegment>
        );
      })}
    </TabsTrack>
  );
}
