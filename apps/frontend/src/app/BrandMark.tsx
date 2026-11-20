import styled, { css } from 'styled-components';

const Mark = styled.span`
  ${({ theme: t }) => css`
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: ${t.radius.xs};
    background: ${t.colors.components.fill.inverted.primary};
    color: ${t.colors.core.glyph.inverted.primary};
    font-size: ${t.font.size.footnote};
    font-weight: 800;
  `}
`;

/** 셸 왼쪽 위 브랜드 글자 상자 */
export function BrandMark() {
  return <Mark aria-hidden="true">학</Mark>;
}
