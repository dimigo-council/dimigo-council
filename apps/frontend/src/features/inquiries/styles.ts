/* 질문과 건의: 학생 질의함 · 학생회 질의함 */
import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { Card } from '../../components/ui/index.ts';

export const ListHead = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${t.spacing[300]};
    margin-bottom: ${t.spacing[400]};
  `}
`;

/** Figma 질의 목록 카드: 안쪽 28 */
export const ListCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[600]};
`;

export const ListTools = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
`;

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Item = styled.li<{ $open: boolean }>`
  ${({ theme: t, $open }) => css`
    border-bottom: 1px solid ${t.colors.core.outline};

    &:last-child {
      border-bottom: 0;
    }
    ${
      $open &&
      css`
        margin: ${t.spacing[200]} 0;
        border: 1px solid ${t.colors.core.outline};
        border-radius: ${t.radius.l};
        background: ${t.colors.background.secondary};
        overflow: hidden;

        &:last-child {
          border-bottom: 1px solid ${t.colors.core.outline};
        }
      `
    }
  `}
`;

export const Row = styled.div<{ $open: boolean }>`
  ${({ theme: t, $open }) => css`
    position: relative;
    display: flex;
    align-items: center;
    gap: ${t.spacing[400]};
    padding: ${t.spacing[400]} ${t.spacing[500]};
    background: ${$open ? t.colors.background.primary : 'transparent'};

    &:has(a:hover) {
      background: ${t.colors.components.interaction.hover};
    }
    @media (max-width: 600px) {
      flex-wrap: wrap;
    }
  `}
`;

export const RowMain = styled.div`
  display: grid;
  flex: 1;
  gap: ${({ theme }) => theme.spacing[100]};
  min-width: 0;
`;

export const RowTitle = styled.h3`
  ${({ theme: t }) => css`
    ${t.text.bodyStrong}
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${t.spacing[200]};
    margin: 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

/** 행 전체를 덮는 제목 링크 */
export const RowLink = styled(Link)`
  color: inherit;
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
    outline: 2px solid ${({ theme }) => theme.colors.core.status.accent};
    outline-offset: -2px;
  }
`;

export const RowMeta = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

export const RowAside = styled.div`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: ${t.spacing[400]};
    color: ${t.colors.core.glyph.tertiary};
    white-space: nowrap;
  `}
`;

/* ---------- 펼친 질의 ---------- */

export const Detail = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[500]};
    padding: ${t.spacing[550]} ${t.spacing[500]};
    border-top: 1px solid ${t.colors.core.outline};
  `}
`;

export const DetailTitle = styled.h4`
  ${({ theme: t }) => css`
    ${t.text.bodyStrong}
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${t.spacing[200]};
    margin: 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

export const Bubble = styled.div<{ $tinted?: boolean }>`
  ${({ theme: t, $tinted }) => css`
    display: flex;
    gap: ${t.spacing[300]};
    padding: ${t.spacing[400]};
    border-radius: ${t.radius.l};
    background: ${
      $tinted ? t.colors.background.secondary : t.colors.background.primary
    };
    ${$tinted && `box-shadow: inset 0 0 0 1px ${t.colors.core.outline};`}
  `}
`;

export const BubbleBody = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[100]};
    min-width: 0;

    > span {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.secondary};
    }
    > p {
      ${t.text.calloutWeak}
      margin: 0;
      color: ${t.colors.core.glyph.primary};
      white-space: pre-wrap;
    }
  `}
`;

export const DetailFoot = styled.div`
  display: flex;

  > a:only-child {
    margin-left: auto;
  }
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Hidden = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

/* ---------- 오른쪽 카드 (새 질의 작성 · 학생회 처리) ---------- */

/** Figma Form Card: 안쪽 28, 사이 24 */
export const SideCard = styled(Card)`
  display: grid;
  gap: ${({ theme }) => theme.spacing[550]};
  padding: ${({ theme }) => theme.spacing[600]};

  @media (min-width: 961px) {
    position: sticky;
    top: 96px;
  }
`;

/** 새 질의 칸: 제목(Callout/Strong) · 입력 · 도움말, 사이 8 */
export const ComposeField = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    gap: ${t.spacing[200]};

    > label:first-child,
    > span:first-child {
      ${t.text.calloutStrong}
      display: flex;
      gap: ${t.spacing[100]};
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

/** 필수 표시 * (Figma Glyph/Accent) */
export const Required = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.accent};
`;

export const Hint = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    margin: 0;
    color: ${t.colors.core.glyph.tertiary};

    a {
      color: ${t.colors.core.glyph.secondary};
    }
  `}
`;

export const ErrorText = styled.p`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    margin: 0;
    color: ${t.colors.core.status.negative};
  `}
`;

/** 익명으로 제출: 테두리 상자, 글 + 토글 */
export const AnonymousBox = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    align-items: center;
    gap: ${t.spacing[300]};
    padding: ${t.spacing[400]};
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};

    > div {
      display: grid;
      flex: 1;
      gap: ${t.spacing[50]};
    }
    strong {
      ${t.text.calloutStrong}
      color: ${t.colors.core.glyph.primary};
    }
    span {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.tertiary};
    }
  `}
`;

export const PanelHead = styled.div`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${t.colors.core.glyph.tertiary};
  `}
`;

export const PanelTitle = styled.h2`
  ${({ theme: t }) => css`
    ${t.text.headlineStrong}
    margin: -8px 0 0;
    color: ${t.colors.core.glyph.primary};
  `}
`;

export const Facts = styled.dl`
  ${({ theme: t }) => css`
    ${t.text.footnoteWeak}
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: ${t.spacing[150]} ${t.spacing[400]};
    margin: 0;

    dt {
      color: ${t.colors.core.glyph.tertiary};
    }
    dd {
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

export const Divider = styled.hr`
  width: 100%;
  margin: 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.core.outline};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;

  > :first-child {
    margin-right: auto;
  }
`;

export const LinkRow = styled.div`
  display: flex;
  gap: 8px;

  > :first-child {
    flex: 1;
    min-width: 0;
  }
`;
