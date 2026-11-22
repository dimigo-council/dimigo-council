import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';

/* ---------- ListRow: 목록의 한 줄. 제목 링크가 행 전체를 덮는다. ---------- */

export const ListGroupRoot = styled.ul`
  ${({ theme: t }) => css`
    margin: 0;
    padding: 0;
    border-radius: ${t.radius.m};
    background: ${t.colors.background.primary};
    box-shadow: inset 0 0 0 1px ${t.colors.core.outline};
    list-style: none;
    overflow: hidden;
  `}
`;

/** 행 전체를 덮는 제목 링크. 라우터 링크는 `<ListRowLink as={Link} to="…">`. */
export const ListRowLink = styled.a`
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
`;

export const ListRowMain = styled.div`
  display: grid;
  flex: 1;
  gap: ${({ theme }) => theme.spacing[50]};
  min-width: 0;
`;

export const ListRowTitle = styled.h3`
  ${({ theme: t }) => css`
    ${t.text.bodyStrong}
    margin: 0;
    color: ${t.colors.core.glyph.primary};
    overflow-wrap: break-word;
  `}
`;

/** 메타 정보 줄. 행 전체 링크 위에서도 메타 줄의 링크를 누를 수 있다. */
export const ListRowMeta = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${t.spacing[100]} ${t.spacing[300]};
    ${t.text.footnoteRegular}
    color: ${t.colors.core.glyph.tertiary};

    a {
      position: relative;
      z-index: 1;
    }
  `}
`;

export const ListRowAside = styled.div`
  ${({ theme: t }) => css`
    display: grid;
    justify-items: end;
    gap: ${t.spacing[50]};
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.footnote};
    line-height: ${t.font.lineHeight.footnote};
    text-align: right;
    white-space: nowrap;

    @media (max-width: 600px) {
      justify-items: start;
      text-align: left;
    }
  `}
`;

export const ListRowActions = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  gap: ${({ theme }) => theme.spacing[200]};

  @media (max-width: 600px) {
    margin-left: auto;
  }
`;

/** 본문 미리보기. `<ListRowItem $excerpt>` 안에 둔다. */
export const ListRowExcerpt = styled.p`
  ${({ theme: t }) => css`
    display: -webkit-box;
    flex-basis: 100%;
    margin: 0;
    overflow: hidden;
    padding: 10px 12px;
    border-radius: ${t.radius.m};
    background: ${t.colors.components.fill.primary};
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    line-height: 1.6;
    white-space: pre-wrap;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  `}
`;

/** Stable class shared by every row, whatever its props. */
const ListRowBase = styled.li``;

/**
 * 행 아래 구분선. 목록의 마지막 행에는 긋지 않는다 (테두리 있는 목록의 아래 테두리와 겹치지 않게).
 * `$divider={false}`면 이 행 아래에는 긋지 않는다.
 */
export const ListRowItem = styled(ListRowBase)<{
  $excerpt?: boolean;
  $divider?: boolean;
}>`
  ${({ theme: t, $excerpt, $divider = true }) => css`
    position: relative;
    display: flex;
    align-items: center;
    gap: ${t.spacing[400]};
    padding: ${t.spacing[400]} ${t.spacing[500]};
    ${$divider && `border-bottom: 1px solid ${t.colors.core.outline};`}

    &:last-child {
      border-bottom: 0;
    }
    &:has(${ListRowLink}:hover) {
      background: ${t.colors.components.interaction.hover};
    }
    &:has(${ListRowLink}:focus-visible) {
      outline: 2px solid ${t.colors.core.status.accent};
      outline-offset: -2px;
    }

    @media (max-width: 600px) {
      flex-wrap: wrap;

      ${ListRowMain} {
        flex-basis: 100%;
      }
    }

    ${
      $excerpt &&
      css`
        flex-wrap: wrap;
        align-items: flex-start;
      `
    }
  `}
`;

export function ListGroup({
  children,
  'aria-label': ariaLabel,
}: {
  children: ReactNode;
  'aria-label'?: string;
}) {
  return <ListGroupRoot aria-label={ariaLabel}>{children}</ListGroupRoot>;
}

export interface ListRowProps {
  title: ReactNode;
  /**
   * 지정하면 제목이 링크가 되고 행 전체를 눌러도 이동한다.
   * 라우터 Link를 쓰려면 href 대신 title에 `<ListRowLink as={Link} to="…">`를 넣는다.
   */
  href?: string;
  /** 메타 정보. 가운뎃점 없이 간격으로 나뉜다. */
  meta?: ReactNode[];
  /** 오른쪽 정보 (D-4, 마감일, 상태 배지 등) */
  aside?: ReactNode;
  /** 오른쪽 끝 버튼. 행 링크보다 위에 놓여 따로 눌린다. */
  actions?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  /** 행 아래 구분선. 기본은 true이고, 목록의 마지막 행에는 늘 긋지 않는다. */
  divider?: boolean;
}

/** 목록의 한 줄 (kit List/ItemList를 링크·메타·버튼이 있는 업무 목록에 맞게 펼친 것). */
export function ListRow({
  title,
  href,
  meta,
  aside,
  actions,
  headingLevel = 3,
  divider = true,
}: ListRowProps) {
  return (
    <ListRowItem $divider={divider}>
      <ListRowMain>
        <ListRowTitle as={`h${headingLevel}`}>
          {href ? <ListRowLink href={href}>{title}</ListRowLink> : title}
        </ListRowTitle>
        {meta && meta.length > 0 && (
          <ListRowMeta>
            {meta.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </ListRowMeta>
        )}
      </ListRowMain>
      {aside && <ListRowAside>{aside}</ListRowAside>}
      {actions && <ListRowActions>{actions}</ListRowActions>}
    </ListRowItem>
  );
}
