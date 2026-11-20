import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import styled, { css, type DefaultTheme } from 'styled-components';
import { Icon, type KitIcon } from './Icon';
import { IconSize } from './IconSize';
import { iconClose } from './icons.generated';
import { interactive, resetButton } from './styles';

export interface InputBoxLook {
  /** Kit Type=Error. */
  error?: boolean;
  disabled?: boolean;
}

/** The kit Input's container look. Focus styling (Type=Focus) comes from :focus-within. */
export const inputBoxStyles = (
  t: DefaultTheme,
  { error = false, disabled = false }: InputBoxLook,
) => css`
  display: flex;
  align-items: center;
  gap: ${t.spacing[200]};
  box-sizing: border-box;
  width: 100%;
  padding: ${t.spacing[300]} ${t.spacing[400]};
  border-radius: ${t.radius.m};
  background: ${t.colors.components.fill.primary};
  box-shadow: inset 0 0 0 1px ${t.colors.core.outline};
  color: ${t.colors.core.glyph.primary};
  cursor: text;

  &:focus-within {
    box-shadow: inset 0 0 0 2px ${t.colors.core.status.accent};
  }
  ${
    error &&
    css`
      &,
      &:focus-within {
        background: ${t.colors.core.status.translucent.negative};
        box-shadow: inset 0 0 0 2px ${t.colors.core.status.negative};
      }
    `
  }
  ${
    disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `
  }
`;

/** The kit Input's text field look (for <input>, <textarea> or <select>). */
export const inputFieldStyles = (t: DefaultTheme) => css`
  flex: 1;
  min-width: 0;
  margin: 0;
  border: 0;
  padding: 0;
  background: none;
  outline: none;
  color: ${t.colors.core.glyph.primary};
  font-family: ${t.font.family};
  font-size: ${t.font.size.body};
  line-height: ${t.font.lineHeight.body};
  font-weight: ${t.font.weight.regular};
  letter-spacing: -0.02em;

  &::placeholder {
    color: ${t.colors.core.glyph.tertiary};
    font-weight: ${t.font.weight.weak};
  }
`;

/** The Input's container. Use it as a selector (`${InputBox}`) to size inputs. */
export const InputBox = styled.div<{
  $error?: boolean;
  $disabled?: boolean;
  $multiline?: boolean;
}>`
  ${({ theme: t, $error, $disabled, $multiline }) => css`
    ${inputBoxStyles(t, { error: $error, disabled: $disabled })}
    ${$multiline && 'align-items: flex-start;'}
  `}
`;

/** The Input's <input>. Use it as a selector (`${InputControl}`). */
export const InputControl = styled.input`
  ${({ theme: t }) => inputFieldStyles(t)}
`;

/** The TextArea's <textarea>. Use it as a selector (`${TextAreaControl}`). */
export const TextAreaControl = styled.textarea`
  ${({ theme: t }) => css`
    ${inputFieldStyles(t)}
    resize: vertical;
    min-height: calc(${t.font.lineHeight.body} * 3);
  `}
`;

const ClearButton = styled.button`
  ${({ theme: t }) => css`
    ${interactive(t, { inset: '-2px', radius: 'xs' })}
    ${resetButton}
    color: ${t.colors.core.glyph.quaternary};
  `}
`;

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  leadingIcon?: KitIcon;
  /** Shows the kit's trailing clear (close) button while there is a value. */
  onClear?: () => void;
  clearLabel?: string;
  /** Kit Type=Error. */
  error?: boolean;
  containerClassName?: string;
}

/** DIMI UI KIT "Input". Focus styling (Type=Focus) comes from :focus-within. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    leadingIcon,
    onClear,
    clearLabel = '지우기',
    error,
    disabled,
    containerClassName,
    value,
    ...rest
  },
  ref,
) {
  const hasValue =
    value !== undefined && value !== null && String(value) !== '';
  return (
    <InputBox
      className={containerClassName}
      $error={error}
      $disabled={disabled}
    >
      <IconSize value={24}>
        {leadingIcon && <Icon icon={leadingIcon} />}
        <InputControl
          ref={ref}
          aria-invalid={error || undefined}
          disabled={disabled}
          value={value}
          {...rest}
        />
        {onClear && hasValue && !disabled && (
          <ClearButton type="button" aria-label={clearLabel} onClick={onClear}>
            <Icon icon={iconClose} />
          </ClearButton>
        )}
      </IconSize>
    </InputBox>
  );
});

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  containerClassName?: string;
}

/** Multi-line version of the kit Input, with the same container. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ error, disabled, containerClassName, ...rest }, ref) {
    return (
      <InputBox
        className={containerClassName}
        $error={error}
        $disabled={disabled}
        $multiline
      >
        <TextAreaControl
          ref={ref}
          aria-invalid={error || undefined}
          disabled={disabled}
          {...rest}
        />
      </InputBox>
    );
  },
);
