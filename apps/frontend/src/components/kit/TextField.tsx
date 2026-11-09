import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

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
  extends FieldFrameProps, InputHTMLAttributes<HTMLInputElement> {}

export function TextField({
  label,
  optional,
  hint,
  error,
  id,
  className,
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
      <input
        id={ids.id}
        className={['field__control', className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { hint, error })}
        {...rest}
      />
    </FieldFrame>
  );
}

export interface TextAreaProps
  extends FieldFrameProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
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
  className,
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
      <textarea
        id={ids.id}
        className={['field__control', className].filter(Boolean).join(' ')}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { hint, error })}
        {...rest}
      />
    </FieldFrame>
  );
}

export interface SelectProps
  extends FieldFrameProps, SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({
  label,
  optional,
  hint,
  error,
  id,
  className,
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
      <select
        id={ids.id}
        className={['field__control', className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { hint, error })}
        {...rest}
      >
        {children}
      </select>
    </FieldFrame>
  );
}
