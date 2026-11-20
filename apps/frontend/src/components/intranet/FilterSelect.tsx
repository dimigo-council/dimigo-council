import { useId, type ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { InputBox } from '../../dimi-ui-kit/index.ts';

/** I-filter-select · 필터 줄: 목록 위 필터와 검색. 줄 안의 kit Input은 오른쪽 검색칸이 된다. */
export const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  > ${InputBox} {
    flex: 1 1 220px;
    max-width: 320px;
    min-height: 36px;
    margin-left: auto;

    @media (max-width: 600px) {
      flex-basis: 100%;
      max-width: none;
      margin-left: 0;
    }
  }
`;

const Root = styled.span`
  ${({ theme: t }) => css`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding-left: 12px;
    border-radius: ${t.radius.m};
    background: ${t.colors.components.fill.primary};
    box-shadow: inset 0 0 0 1px ${t.colors.core.outline};
    color: ${t.colors.core.glyph.tertiary};
    font-size: ${t.font.size.callout};

    &:focus-within {
      box-shadow: inset 0 0 0 2px ${t.colors.core.status.accent};
    }
  `}
`;

const Control = styled.select`
  ${({ theme: t }) => css`
    width: auto;
    min-height: ${t.height[200]};
    margin: 0;
    font: inherit;
    padding: 0 28px 0 0;
    border: 0;
    background-color: transparent;
    color: ${t.colors.core.glyph.primary};
    font-weight: 700;

    &:focus-visible {
      outline: none;
    }
    @supports (appearance: base-select) {
      padding-right: 12px;
    }
  `}
`;

export interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** <option> 목록. 첫 항목은 보통 value=""인 "전체"다. */
  children: ReactNode;
}

/** I-filter-select: 목록 위 필터 줄의 "담당 전체부서" 같은 이름표 붙은 선택 상자 */
export function FilterSelect({
  label,
  value,
  onChange,
  children,
}: FilterSelectProps) {
  const id = useId();
  return (
    <Root>
      <label htmlFor={id}>{label}</label>
      <Control
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </Control>
    </Root>
  );
}
