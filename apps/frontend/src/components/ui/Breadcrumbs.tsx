import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { Icon } from '../../dimi-ui-kit/index.ts';
import { iconArrowForwardIos } from '../../dimi-ui-kit/icons';

/* Figma "Breadcrumb": Footnote/Regular, 지난 단계는 Tertiary, 지금 화면은 Secondary, 화살표 12, 간격 6 */
const Root = styled.nav`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}

    > ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: ${t.spacing[150]};
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: inline-flex;
      align-items: center;
      gap: ${t.spacing[150]};
      color: ${t.colors.core.glyph.tertiary};
    }
    li:last-child {
      color: ${t.colors.core.glyph.secondary};
    }
    a {
      color: inherit;
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

export interface BreadcrumbItem {
  label: string;
  /** 없으면 지금 화면 */
  to?: string;
}

/** 상세·작성 화면 위의 경로 (설문 > 설문 참여) */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Root aria-label="경로">
      <ol>
        {items.map((item, index) => (
          <li key={item.label}>
            {index > 0 && (
              <Icon icon={iconArrowForwardIos} size={12} aria-hidden />
            )}
            {item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </Root>
  );
}
