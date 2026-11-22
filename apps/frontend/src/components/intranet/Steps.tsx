import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { Icon } from '../../dimi-ui-kit/index.ts';
import { iconCheck } from '../../dimi-ui-kit/icons';
import { VisuallyHidden } from '../ui/VisuallyHidden.ts';

export type StepState = 'done' | 'todo';

export interface StepItem {
  label: string;
  state: StepState;
  /** 단계 아래 작은 글씨 (날짜, 예정 등) */
  note?: ReactNode;
}

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
    z-index: 1;
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    margin-bottom: ${t.spacing[200]};
    border-radius: ${t.radius.xs};
    background: ${t.colors.components.fill.secondary};
    color: ${t.colors.core.onColor.primary};
  `}
`;

const Label = styled.span`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

const Note = styled.span`
  ${({ theme: t }) => css`
    ${t.text.captionWeak}
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

const Item = styled.li<{ $state: StepState; $lineOn: boolean }>`
  ${({ theme: t, $state, $lineOn }) => css`
    position: relative;
    display: grid;
    justify-items: center;
    text-align: center;

    /* 다음 단계까지 잇는 선 */
    &::after {
      content: '';
      position: absolute;
      top: 11px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: ${
        $lineOn
          ? t.colors.core.status.accent
          : t.colors.components.fill.secondary
      };
    }
    &:last-child::after {
      display: none;
    }
    &:first-child {
      justify-items: start;
      text-align: left;
    }
    &:first-child::after {
      left: 12px;
    }
    &:last-child {
      justify-items: end;
      text-align: right;
    }

    ${
      $state === 'done' &&
      css`
        ${Marker} {
          background: ${t.colors.core.status.accent};
        }
        ${Label} {
          ${t.text.footnoteStrong}
          color: ${t.colors.core.glyph.primary};
        }
      `
    }
  `}
`;

/** 처리 단계 (접수 → 답변 완료 → 처리 완료). 지난 단계는 분홍 체크, 남은 단계는 회색. */
export function Steps({
  items,
  'aria-label': ariaLabel,
}: {
  items: StepItem[];
  'aria-label': string;
}) {
  const lastDone = items.map((item) => item.state).lastIndexOf('done');
  return (
    <List aria-label={ariaLabel}>
      {items.map((item, index) => (
        <Item
          key={item.label}
          $state={item.state}
          $lineOn={index < lastDone}
          aria-current={index === lastDone ? 'step' : undefined}
        >
          <Marker aria-hidden="true">
            {item.state === 'done' && <Icon icon={iconCheck} size={18} />}
          </Marker>
          <Label>
            {item.label}
            <VisuallyHidden>
              , {item.state === 'done' ? '완료' : '예정'}
            </VisuallyHidden>
          </Label>
          {item.note && <Note>{item.note}</Note>}
        </Item>
      ))}
    </List>
  );
}
