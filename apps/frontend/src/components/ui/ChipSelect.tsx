import type { SelectHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { chipStyles, Icon } from '../../dimi-ui-kit/index.ts';
import { iconKeyboardArrowDown } from '../../dimi-ui-kit/icons';

const Root = styled.span`
  ${({ theme: t }) => css`
    ${chipStyles(t, { theme: 'outlined', interactive: false })}
    position: relative;
    display: inline-flex;
    flex: none;
    align-items: center;
    padding: 0;

    &:focus-within {
      box-shadow: inset 0 0 0 2px ${t.colors.core.status.accent};
    }
    > svg {
      position: absolute;
      right: ${t.spacing[300]};
      pointer-events: none;
    }
  `}
`;

const Control = styled.select`
  ${({ theme: t }) => css`
    ${t.text.footnoteRegular}
    margin: 0;
    padding: ${t.spacing[150]} calc(${t.spacing[300]} + 22px) ${t.spacing[150]}
      ${t.spacing[300]};
    border: 0;
    background: none;
    color: ${t.colors.core.glyph.secondary};
    appearance: none;
    cursor: pointer;

    &:focus-visible {
      outline: none;
    }
    &:disabled {
      cursor: not-allowed;
    }
    option {
      background: ${t.colors.background.primary};
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

/** kit Chip(Outlined) 모양의 선택 상자: Figma "마감 임박순 ⌄", 설문 문항 형식 */
export function ChipSelect({
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Root className={className}>
      <Control {...rest} />
      <Icon icon={iconKeyboardArrowDown} size={16} />
    </Root>
  );
}
