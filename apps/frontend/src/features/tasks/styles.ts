/* 업무: 업무 보드 · 업무 추가 · 업무 상세 */
import { Link } from 'react-router';
import styled, { css, type DefaultTheme } from 'styled-components';
import { Card } from '../../components/ui/index.ts';
import type { TaskStatus } from './types.ts';

/* ---------- 보드 ---------- */

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[200]};
  padding: ${({ theme }) => theme.spacing[100]} 0;
`;

export const Board = styled(Card)`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: start;
  gap: 16px;
  padding: 16px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Column = styled.section`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[300]};
    padding: ${t.spacing[300]};
    border-radius: ${t.radius.l};
    background: ${t.colors.components.fill.primary};
  `}
`;

const dotColor = (t: DefaultTheme, status: TaskStatus) =>
  ({
    예정됨: t.colors.core.glyph.tertiary,
    '진행 중': t.colors.core.status.accent,
    '검토 요청': t.colors.core.status.info,
    완료: t.colors.core.status.positive,
  })[status];

export const ColumnTitle = styled.h2<{ $status: TaskStatus }>`
  ${({ theme: t, $status }) => css`
    ${t.text.calloutStrong}
    display: flex;
    align-items: center;
    gap: ${t.spacing[200]};
    margin: 0;
    padding: ${t.spacing[100]} ${t.spacing[100]} 0;
    color: ${t.colors.core.glyph.primary};

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: ${t.radius.circle};
      background: ${dotColor(t, $status)};
    }
    > span {
      ${t.text.calloutRegular}
      color: ${t.colors.core.glyph.tertiary};
    }
  `}
`;

export const Cards = styled.ul`
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

/** 카드 오른쪽 위 ⋯ (행 전체 링크보다 위) */
export const CardMore = styled(Link)`
  ${({ theme: t }) => css`
    position: relative;
    z-index: 1;
    display: inline-flex;
    border-radius: ${t.radius.xs};
    color: ${t.colors.core.glyph.tertiary};

    &:hover {
      background: ${t.colors.components.interaction.hover};
    }
    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
    }
  `}
`;

export const TaskCard = styled.li<{ $done: boolean }>`
  ${({ theme: t, $done }) => css`
    position: relative;
    display: grid;
    gap: ${t.spacing[300]};
    padding: ${t.spacing[400]};
    border-radius: ${t.radius.l};
    background: ${t.colors.background.primary};
    box-shadow: 0 1px 2px ${t.colors.core.shadow};
    ${$done && `opacity: 0.6;`}

    &:has(a:hover) {
      box-shadow: inset 0 0 0 1px ${t.colors.core.line};
    }
  `}
`;

export const CardTitleLink = styled(Link)`
  ${({ theme: t }) => css`
    ${t.text.bodyStrong}
    color: ${t.colors.core.glyph.primary};
    text-decoration: none;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
    }
    &:focus-visible {
      outline: none;
    }
    &:focus-visible::after {
      outline: 2px solid ${t.colors.core.status.accent};
      border-radius: ${t.radius.l};
    }
  `}
`;

export const CardFoot = styled.div<{ $soon: boolean }>`
  ${({ theme: t, $soon }) => css`
    ${t.text.footnoteWeak}
    display: flex;
    align-items: center;
    gap: ${t.spacing[150]};
    color: ${$soon ? t.colors.core.status.accent : t.colors.core.glyph.tertiary};

    > :last-child {
      margin-left: auto;
    }
  `}
`;

export const EmptyColumn = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    margin: 0;
    padding: ${t.spacing[400]} ${t.spacing[100]};
    color: ${t.colors.core.glyph.tertiary};
    text-align: center;
  `}
`;

/* ---------- 상세 ---------- */

export const LogForm = styled.form`
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr) auto;
  gap: 8px;
  margin-top: 24px;

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/** 수정 중인 머리 카드: 왼쪽 입력 줄, 오른쪽 위 취소·저장 */
export const EditForm = styled.form`
  ${({ theme: t }) => css`
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${t.spacing[400]};
  `}
`;

export const EditRow = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${t.spacing[300]} ${t.spacing[400]};
  `}
`;

/** 아이콘 + 이름(Callout/Regular, Secondary) 옆에 입력 */
export const InlineField = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    align-items: center;
    gap: ${t.spacing[200]};

    > label {
      ${t.text.calloutRegular}
      display: inline-flex;
      flex: none;
      align-items: center;
      gap: ${t.spacing[150]};
      color: ${t.colors.core.glyph.secondary};
    }
    > div {
      width: 160px;
    }
  `}
`;

export const EditTitle = styled.div`
  && {
    width: 320px;
  }
`;

export const EditError = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    margin: 0;
    color: ${t.colors.core.status.negative};
  `}
`;

export const StatusHint = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;
