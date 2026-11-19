import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Icon, type KitIcon } from './Icon';
import { iconClose } from './icons.generated';
import { cx } from './cx';

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
    className,
    value,
    ...rest
  },
  ref,
) {
  const hasValue =
    value !== undefined && value !== null && String(value) !== '';
  return (
    <div
      className={cx('kit-input', containerClassName)}
      data-error={error ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      {leadingIcon && <Icon icon={leadingIcon} />}
      <input
        ref={ref}
        className={cx('kit-input-field', className)}
        aria-invalid={error || undefined}
        disabled={disabled}
        value={value}
        {...rest}
      />
      {onClear && hasValue && !disabled && (
        <button
          type="button"
          className="kit-reset-button kit-input-clear kit-interactive"
          aria-label={clearLabel}
          onClick={onClear}
        >
          <Icon icon={iconClose} />
        </button>
      )}
    </div>
  );
});

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  containerClassName?: string;
}

/** Multi-line version of the kit Input, with the same container. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    { error, disabled, containerClassName, className, ...rest },
    ref,
  ) {
    return (
      <div
        className={cx('kit-input', containerClassName)}
        data-error={error ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        style={{ alignItems: 'flex-start' }}
      >
        <textarea
          ref={ref}
          className={cx('kit-input-field', className)}
          aria-invalid={error || undefined}
          disabled={disabled}
          {...rest}
        />
      </div>
    );
  },
);
