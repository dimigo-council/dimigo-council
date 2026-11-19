import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import {
  Icon,
  Input,
  TextArea as KitTextArea,
  type InputProps,
  type TextAreaProps as KitTextAreaProps,
} from '../../dimi-ui-kit/index.ts';
import { iconKeyboardArrowDown } from '../../dimi-ui-kit/icons';

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
    <div className="field">
      <label className="field__label" htmlFor={ids.id}>
        {label}
        {optional && <span className="field__optional">선택</span>}
      </label>
      {children}
      <div className="field__foot">
        {error ? (
          <span className="field__error" id={ids.errorId}>
            {error}
          </span>
        ) : (
          hint && (
            <span className="field__hint" id={ids.hintId}>
              {hint}
            </span>
          )
        )}
        {count}
      </div>
    </div>
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
    <span
      className="field__count"
      data-over={maxLength !== undefined && length > maxLength}
    >
      {maxLength !== undefined ? `${length} / ${maxLength}` : length}
    </span>
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
    <div
      className={['kit-input ui-select', containerClassName]
        .filter(Boolean)
        .join(' ')}
      data-error={error ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      <select
        className={['kit-input-field', className].filter(Boolean).join(' ')}
        aria-invalid={error || undefined}
        disabled={disabled}
        {...rest}
      >
        {children}
      </select>
      <Icon icon={iconKeyboardArrowDown} className="ui-select__icon" />
    </div>
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
