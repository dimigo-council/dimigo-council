/* 화면 본문 공용 조각: 링크, 패널, 정보 목록, 2단, 표, 폼 버튼 줄. */
import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { ButtonRoot } from '../../dimi-ui-kit/index.ts';
import { FilterBar } from '../intranet/FilterSelect.tsx';
import { MeterRoot } from '../intranet/Meter.tsx';

const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.core.status.accent};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.radius.xs};
  }
`;

export const BackLink = styled(Link)`
  ${({ theme: t }) => css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 16px;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    text-decoration: none;

    &:hover {
      color: ${t.colors.core.glyph.primary};
    }
  `}
  ${focusRing}
`;

export const textLinkStyles = css`
  ${({ theme: t }) => css`
    color: ${t.colors.core.status.accent};
    font-size: ${t.font.size.callout};
    font-weight: 700;
    text-decoration: none;
    text-underline-offset: 3px;

    &:hover {
      text-decoration: underline;
    }
  `}
  ${focusRing}
`;

export const TextLink = styled(Link)`
  ${textLinkStyles}
`;

export const MetaRow = styled.span`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: 2px 12px;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};
  `}
`;

export const EmptyState = styled.p`
  ${({ theme: t }) => css`
    margin: 0;
    padding: 40px 16px;
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};
    text-align: center;
  `}
`;

/** 목록 화면 맨 위 줄: 왼쪽 보기 전환·필터, 오른쪽 주요 동작 */
export const PageToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  > ${FilterBar} {
    flex: 1;
  }

  /* 좁은 화면: 필터 줄이 한 줄을 다 쓰고 주요 동작은 그 아래 오른쪽 */
  @media (max-width: 600px) {
    > ${FilterBar} {
      flex-basis: 100%;
    }
    > ${FilterBar} + ${ButtonRoot} {
      margin-left: auto;
    }
  }
`;

/* ---------- 패널: 제목 줄이 있는 흰 상자 ---------- */

export const Panel = styled.section<{ $padded?: boolean }>`
  ${({ theme: t, $padded }) => css`
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};
    ${$padded && 'padding: 20px;'}
  `}
`;

/** 제목 줄 오른쪽 작은 버튼 (고치기 등): `styled(TextButton)` 안에 넣는다. */
export const panelAction = css`
  margin: -6px -8px -6px 0;
`;

export const PanelTitle = styled.h2<{ $split?: boolean }>`
  ${({ theme: t, $split }) => css`
    margin: 0;
    padding: 16px 18px;
    border-bottom: 1px solid ${t.colors.core.outline};
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    font-weight: 700;
    ${
      $split &&
      css`
        display: flex;
        justify-content: space-between;
        gap: 12px;
      `
    }
  `}
`;

/** 제목 줄 안에 다른 요소와 함께 놓이는 제목 */
export const PanelHeading = styled.h2`
  margin: 0;
  font: inherit;
`;

export const PanelAside = styled.span`
  ${({ theme: t }) => css`
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};
    font-weight: 400;
  `}
`;

export const PanelBody = styled.div`
  display: grid;
  gap: 12px;
  padding: 16px 18px;
`;

export const PanelNote = styled.p`
  ${({ theme: t }) => css`
    margin: 0;
    padding: 0 18px 16px;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};
    line-height: 1.6;
  `}
`;

export const PanelProseEmpty = styled.p``;

/** 패널 안 긴 글 (업무 내용, 보고서). 문단은 빈 줄로 나뉜다. */
export const PanelProse = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    gap: 12px;
    padding: 16px 18px;
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    line-height: 1.7;

    p {
      margin: 0;
      white-space: pre-wrap;
    }
    ${PanelProseEmpty} {
      color: ${t.colors.core.glyph.tertiary};
    }
  `}
`;

/* ---------- 정보 목록: 이름과 값 두 줄 ---------- */

export const InfoList = styled.dl`
  ${({ theme: t }) => css`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 10px 16px;
    margin: 0;
    padding: 16px 18px;
    font-size: ${t.font.size.callout};

    dt {
      color: ${t.colors.core.glyph.tertiary};
    }
    dd {
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

export const InfoListInline = styled.dd`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
`;

/* ---------- 2단: 본문 + 오른쪽 정보 (건의, 공개 안건) ---------- */

export const SplitLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  align-items: start;
  gap: 24px;
  margin-top: 24px;

  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const SplitMain = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;
`;

export const SplitAside = styled.aside`
  display: grid;
  gap: 16px;
  min-width: 0;
`;

/* ---------- 경로: 상세 화면 위 "안건 / A-26-031" ---------- */

export const Breadcrumb = styled.nav`
  ${({ theme: t }) => css`
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};

    a {
      color: ${t.colors.core.glyph.tertiary};
      text-decoration: none;
    }
    a:hover {
      color: ${t.colors.core.glyph.primary};
      text-decoration: underline;
    }
    a:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
      border-radius: ${t.radius.xs};
    }
  `}
`;

/* ---------- 표 ---------- */

export const TableWrap = styled.div`
  ${({ theme: t }) => css`
    overflow-x: auto;
    border: 1px solid ${t.colors.core.outline};
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};

    &:focus-visible {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: 2px;
    }
  `}
`;

/** 표 칸: $num 오른쪽 정렬 숫자, $muted 흐린 글자. `<th>`나 `<span>`은 `as`로 쓴다. */
export const DataCell = styled.td<{ $num?: boolean; $muted?: boolean }>`
  ${({ theme: t, $num, $muted }) => css`
    && {
      ${
        $num &&
        css`
          text-align: right;
          font-variant-numeric: tabular-nums;
        `
      }
      ${$muted && `color: ${t.colors.core.glyph.tertiary};`}
    }
  `}
`;

export const DataTable = styled.table`
  ${({ theme: t }) => css`
    width: 100%;
    min-width: 920px;
    border-collapse: collapse;
    font-size: ${t.font.size.callout};

    th,
    td {
      padding: 14px 14px;
      border-bottom: 1px solid ${t.colors.core.outline};
      color: ${t.colors.core.glyph.primary};
      font-weight: 400;
      text-align: left;
      vertical-align: middle;
      white-space: nowrap;
    }
    thead th {
      padding-block: 12px;
      background: ${t.colors.components.fill.primary};
      color: ${t.colors.core.glyph.secondary};
      font-size: ${t.font.size.footnote};
      font-weight: 700;
    }
    tbody tr:last-child > * {
      border-bottom: 0;
    }
    tbody tr:hover {
      background: ${t.colors.components.fill.primary};
    }
    ${MeterRoot} {
      flex-direction: row-reverse;
      width: 104px;
    }
  `}
`;

export const DataTableLink = styled(Link)`
  ${({ theme: t }) => css`
    color: ${t.colors.core.glyph.primary};
    font-size: ${t.font.size.callout};
    font-weight: 700;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  `}
  ${focusRing}
`;

export const Owner = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

/* ---------- 폼 공용: 오른쪽 끝 버튼 줄, 댓글 입력칸 ---------- */

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

/** 댓글 입력칸: 댓글 TextArea의 틀(`${InputBox}`)에 넣는다. */
export const commentInput = css`
  min-height: 96px;
  padding: 10px 12px;
  line-height: 1.6;
  resize: vertical;
`;
