/* 학생회 활동: 공개 안건 목록 · 공개 안건 상세 */
import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { ListRowItem, MetaRow } from '../../components/ui/index.ts';

/* ---------- 목록 ---------- */

export const AgendaList = styled.div`
  margin: 16px 0 0;
`;

export const AgendaRow = styled(ListRowItem)`
  flex-wrap: wrap;
  align-items: flex-start;
`;

export const AgendaRowSummary = styled.p`
  ${({ theme: t }) => css`
    flex-basis: 100%;
    margin: 0;
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    line-height: 1.6;
  `}
`;

/* ---------- 상세 ---------- */

export const AgendaSummary = styled.dl`
  ${({ theme: t }) => css`
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 14px 24px;
    margin: 0;
    padding: 20px 18px;
    font-size: ${t.font.size.callout};
    line-height: 1.7;

    dt {
      color: ${t.colors.core.glyph.primary};
      font-weight: 700;
    }
    dd {
      margin: 0;
      color: ${t.colors.core.glyph.primary};
    }

    @media (max-width: 520px) {
      grid-template-columns: minmax(0, 1fr);
      gap: 2px;

      dd + dt {
        margin-top: 12px;
      }
    }
  `}
`;

export const HiddenRecords = styled.p`
  ${({ theme: t }) => css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 18px 18px;
    padding: 12px 14px;
    border: 1px dashed ${t.colors.core.line};
    border-radius: ${t.radius.m};
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};

    svg {
      flex: none;
    }
  `}
`;

export const RelatedList = styled.ul`
  ${({ theme: t }) => css`
    margin: 0;
    padding: 0 18px;
    list-style: none;

    li {
      display: grid;
      gap: 4px;
      padding: 14px 0;
    }
    li + li {
      border-top: 1px solid ${t.colors.core.outline};
    }
    ${MetaRow} {
      font-size: ${t.font.size.footnote};
    }
  `}
`;

const relatedTitle = css`
  color: ${({ theme }) => theme.colors.core.glyph.primary};
  font-size: ${({ theme }) => theme.font.size.callout};
  font-weight: 700;
  text-decoration: none;
`;

export const RelatedTitle = styled.span`
  ${relatedTitle}
`;

export const RelatedTitleLink = styled(Link)`
  ${relatedTitle}

  &:hover {
    text-decoration: underline;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.core.status.accent};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.radius.xs};
  }
`;
