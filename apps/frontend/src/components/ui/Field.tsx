import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import {
  Icon,
  Input,
  InputBox,
  TextArea as KitTextArea,
  inputFieldStyles,
  type InputProps,
  type TextAreaProps as KitTextAreaProps,
} from '../../dimi-ui-kit/index.ts';
import { iconKeyboardArrowDown } from '../../dimi-ui-kit/icons';

/* ---------- Field: kit InputField의 제목·도움말 ---------- */

export const FieldRoot = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[200]};
  min-width: 0;
`;

export const FieldLabel = styled.label`
  ${({ theme: t }) => css`
    color: ${t.colors.core.glyph.secondary};
    font-size: ${t.font.size.callout};
    line-height: ${t.font.lineHeight.callout};
    font-weight: ${t.font.weight.regular};
    letter-spacing: -0.02em;
  `}
`;

export const FieldOptional = styled.span`
  ${({ theme: t }) => css`
    margin-left: ${t.spacing[100]};
    color: ${t.colors.core.glyph.tertiary};
    font-weight: ${t.font.weight.weak};
  `}
`;

export const FieldFoot = styled.div`
  ${({ theme: t }) => css`
    display: flex;
    justify-content: space-between;
    gap: ${t.spacing[300]};
    min-height: ${t.font.lineHeight.footnote};
    padding: 0 ${t.spacing[100]};
    font-size: ${t.font.size.footnote};
    line-height: ${t.font.lineHeight.footnote};

    &:empty {
      display: none;
    }
  `}
`;

export const FieldHint = styled.span`
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
`;

export const FieldError = styled.span`
  color: ${({ theme }) => theme.colors.core.status.negative};
`;

export const FieldCount = styled.span<{ $over?: boolean }>`
  ${({ theme: t, $over }) => css`
    margin-left: auto;
    color: ${$over ? t.colors.core.status.negative : t.colors.core.glyph.tertiary};
    font-variant-numeric: tabular-nums;
  `}
`;

/* Select: kit Input 틀 안의 네이티브 select. 선택자로 쓴다 (`${SelectBox}`). */
export const SelectBox = styled(InputBox)`
  position: relative;
  padding: 0;
`;

const SelectField = styled.select`
  ${({ theme: t }) => css`
    ${inputFieldStyles(t)}
    padding: ${t.spacing[300]} calc(${t.spacing[400]} + 24px) ${t.spacing[300]}
      ${t.spacing[400]};
    appearance: none;
    cursor: pointer;

    option {
      background-color: ${t.colors.background.primary};
      color: ${t.colors.core.glyph.primary};
    }
  `}
`;

const SelectIcon = styled(Icon)`
  position: absolute;
  right: ${({ theme }) => theme.spacing[300]};
  color: ${({ theme }) => theme.colors.core.glyph.tertiary};
  pointer-events: none;
`;

/** Label, hint and error around a DIMI UI KIT input (the kit's InputField pattern, plus 선택·글자 수). */
interface FieldFrameProps {
  label: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
}

interface FieldIds {
  id: string;
  hintId: string;
  errorId: string;
}

function useFieldIds(id?: string): FieldIds {
  const generated = useId();
  const base = id ?? generated;
  return { id: base, hintId: `${base}-hint`, errorId: `${base}-error` };
}

function describedBy(
  ids: FieldIds,
  { hint, error }: Pick<FieldFrameProps, 'hint' | 'error'>,
) {
  const parts = [error ? ids.errorId : null, hint ? ids.hintId : null];
  return parts.filter(Boolean).join(' ') || undefined;
}

function FieldFrame({
  ids,
  label,
  optional,
  hint,
  error,
  count,
  children,
}: FieldFrameProps & {
  ids: FieldIds;
  count?: ReactNode;
  children: ReactNode;
}) {
  return (
    <FieldRoot>
      <FieldLabel htmlFor={ids.id}>
        {label}
        {optional && <FieldOptional>선택</FieldOptional>}
      </FieldLabel>
      {children}
      <FieldFoot>
        {error ? (
          <FieldError id={ids.errorId}>{error}</FieldError>
        ) : (
          hint && <FieldHint id={ids.hintId}>{hint}</FieldHint>
        )}
        {count}
      </FieldFoot>
    </FieldRoot>
  );
}

export interface TextFieldProps
  extends FieldFrameProps, Omit<InputProps, 'error'> {}

export function TextField({
  label,
  optional,
  hint,
  error,
  id,
  ...rest
}: TextFieldProps) {
  const ids = useFieldIds(id);
  return (
    <FieldFrame
      ids={ids}
      label={label}
      optional={optional}
      hint={hint}
      error={error}
    >
      <Input
        id={ids.id}
        error={Boolean(error)}
        aria-describedby={describedBy(ids, { hint, error })}
        {...rest}
      />
    </FieldFrame>
  );
}

export interface TextAreaProps
  extends FieldFrameProps, Omit<KitTextAreaProps, 'error'> {
  /** 글자 수 표시. maxLength와 함께 쓰면 "0 / 500" 형태로 보인다. */
  showCount?: boolean;
}

export function TextArea({
  label,
  optional,
  hint,
  error,
  showCount,
  id,
  value,
  maxLength,
  ...rest
}: TextAreaProps) {
  const ids = useFieldIds(id);
  const length = typeof value === 'string' ? value.length : 0;
  const count = showCount ? (
    <FieldCount $over={maxLength !== undefined && length > maxLength}>
      {maxLength !== undefined ? `${length} / ${maxLength}` : length}
    </FieldCount>
  ) : undefined;

  return (
    <FieldFrame
      ids={ids}
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      count={count}
    >
      <KitTextArea
        id={ids.id}
        value={value}
        maxLength={maxLength}
        error={Boolean(error)}
        aria-describedby={describedBy(ids, { hint, error })}
        {...rest}
      />
    </FieldFrame>
  );
}

export interface SelectControlProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  containerClassName?: string;
}

/** A native select drawn in the kit Input container, with the kit's chevron. */
export function SelectControl({
  error,
  disabled,
  containerClassName,
  className,
  children,
  ...rest
}: SelectControlProps) {
  return (
    <SelectBox
      className={containerClassName}
      $error={error}
      $disabled={disabled}
    >
      <SelectField
        className={className}
        aria-invalid={error || undefined}
        disabled={disabled}
        {...rest}
      >
        {children}
      </SelectField>
      <SelectIcon icon={iconKeyboardArrowDown} size={20} />
    </SelectBox>
  );
}

export interface SelectProps
  extends FieldFrameProps, Omit<SelectControlProps, 'error'> {}

export function Select({
  label,
  optional,
  hint,
  error,
  id,
  children,
  ...rest
}: SelectProps) {
  const ids = useFieldIds(id);
  return (
    <FieldFrame
      ids={ids}
      label={label}
      optional={optional}
      hint={hint}
      error={error}
    >
      <SelectControl
        id={ids.id}
        error={Boolean(error)}
        aria-describedby={describedBy(ids, { hint, error })}
        {...rest}
      >
        {children}
      </SelectControl>
    </FieldFrame>
  );
}
