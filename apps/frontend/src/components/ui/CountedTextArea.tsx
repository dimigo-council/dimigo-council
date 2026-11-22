import type { TextareaHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

/* Figma "Textarea": kit Input 상자(Fill/Primary, 안쪽 16) 안에 글과 "66 / 1000" 글자 수 */
const Root = styled.label<{ $error?: boolean }>`
  ${({ theme: t, $error }) => css`
    display: grid;
    gap: ${t.spacing[200]};
    padding: ${t.spacing[400]};
    border-radius: ${t.radius.m};
    background: ${t.colors.components.fill.primary};
    box-shadow: inset 0 0 0 1px ${t.colors.core.outline};
    cursor: text;

    &:focus-within {
      box-shadow: inset 0 0 0 2px ${t.colors.core.status.accent};
    }
    ${
      $error &&
      css`
        &,
        &:focus-within {
          background: ${t.colors.core.status.translucent.negative};
          box-shadow: inset 0 0 0 2px ${t.colors.core.status.negative};
        }
      `
    }
    > textarea {
      ${t.text.calloutRegular}
      min-height: 110px;
      margin: 0;
      padding: 0;
      border: 0;
      background: none;
      color: ${t.colors.core.glyph.primary};
      font-family: inherit;
      outline: none;
      resize: vertical;
    }
    > textarea::placeholder {
      color: ${t.colors.core.glyph.tertiary};
    }
    > span {
      ${t.text.footnoteRegular}
      color: ${t.colors.core.glyph.tertiary};
      font-variant-numeric: tabular-nums;
    }
    &:has(textarea:disabled) {
      opacity: 0.3;
      cursor: not-allowed;
    }
  `}
`;

export interface CountedTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  maxLength: number;
  error?: boolean;
}

/** 글자 수가 상자 안에 붙는 여러 줄 입력 (설문 장문형, 새 질의 내용) */
export function CountedTextArea({
  value,
  maxLength,
  error,
  className,
  ...rest
}: CountedTextAreaProps) {
  return (
    <Root className={className} $error={error}>
      <textarea
        value={value}
        maxLength={maxLength}
        aria-invalid={error || undefined}
        {...rest}
      />
      <span aria-hidden="true">
        {value.length} / {maxLength}
      </span>
    </Root>
  );
}
