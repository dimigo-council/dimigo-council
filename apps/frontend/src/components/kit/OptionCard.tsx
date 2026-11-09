import type { InputHTMLAttributes, ReactNode } from 'react';

export interface OptionCardProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'title'
> {
  title: ReactNode;
  description?: ReactNode;
  /** radio: 같은 name끼리 하나만 고른다. checkbox: 여러 개를 고른다. */
  type?: 'radio' | 'checkbox';
}

/** 설명이 붙을 수 있는 큰 선택지 (실명/익명, 공개 범위, 설문 보기) */
export function OptionCard({
  title,
  description,
  type = 'radio',
  className,
  ...rest
}: OptionCardProps) {
  return (
    <label className={['option-card', className].filter(Boolean).join(' ')}>
      <input type={type} className="choice__input visually-hidden" {...rest} />
      <span
        className={`choice__box choice__box--${type === 'radio' ? 'radio' : 'check'}`}
        aria-hidden="true"
      />
      <span className="option-card__text">
        <span className="option-card__title">{title}</span>
        {description && (
          <span className="option-card__description">{description}</span>
        )}
      </span>
    </label>
  );
}

export function OptionCardGroup({
  legend,
  children,
}: {
  legend: ReactNode;
  children: ReactNode;
}) {
  return (
    <fieldset className="option-group">
      <legend className="field__label">{legend}</legend>
      <div className="option-group__cards">{children}</div>
    </fieldset>
  );
}
