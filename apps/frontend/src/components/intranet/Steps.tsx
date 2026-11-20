import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { VisuallyHidden } from '../ui/VisuallyHidden.ts';

export type StepState = 'done' | 'current' | 'todo';

export interface StepItem {
  label: string;
  state: StepState;
  /** 단계 아래 작은 글씨 (날짜, 담당 등) */
  note?: ReactNode;
}

const stateText: Record<StepState, string> = {
  done: '완료',
  current: '현재 단계',
  todo: '예정',
};

const List = styled.ol`
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Marker = styled.span`
  ${({ theme: t }) => css`
    position: relative;
    width: 14px;
    height: 14px;
    margin-bottom: 8px;
    border: 2px solid ${t.colors.core.line};
    border-radius: 1px;
    background: ${t.colors.background.primary};
  `}
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.callout};
`;

const Note = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  font-size: ${({ theme }) => theme.font.size.footnote};
`;

const Item = styled.li<{ $state: StepState }>`
  ${({ theme: t, $state }) => css`
    position: relative;
    display: grid;
    gap: 2px;
    padding-right: 8px;

    &::before {
      content: '';
      position: absolute;
      top: 6px;
      left: 14px;
      right: 0;
      height: 2px;
      background: ${
        $state === 'done'
          ? t.colors.components.fill.inverted.primary
          : t.colors.core.outline
      };
    }
    &:last-child::before {
      display: none;
    }
    ${
      $state === 'done' &&
      css`
        ${Marker} {
          border-color: ${t.colors.components.fill.inverted.primary};
          background: ${t.colors.components.fill.inverted.primary};
        }
      `
    }
    ${
      $state === 'current' &&
      css`
        ${Marker} {
          border-color: ${t.colors.core.glyph.primary};
        }
        ${Label} {
          font-weight: 700;
        }
      `
    }
    ${
      $state !== 'todo' &&
      css`
        ${Label} {
          color: ${t.colors.core.glyph.primary};
        }
      `
    }
  `}
`;

/** I-steps: 안건·건의의 단계. 지난 단계는 채운 사각형, 현재는 빈 사각형, 남은 단계는 흐리게. */
export function Steps({
  items,
  'aria-label': ariaLabel,
}: {
  items: StepItem[];
  'aria-label': string;
}) {
  return (
    <List aria-label={ariaLabel}>
      {items.map((item) => (
        <Item
          key={item.label}
          $state={item.state}
          aria-current={item.state === 'current' ? 'step' : undefined}
        >
          <Marker aria-hidden="true" />
          <Label>
            {item.label}
            <VisuallyHidden>, {stateText[item.state]}</VisuallyHidden>
          </Label>
          {item.note && <Note>{item.note}</Note>}
        </Item>
      ))}
    </List>
  );
}
