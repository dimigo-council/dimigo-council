import type { InputHTMLAttributes, ReactNode } from 'react';

export interface ChoiceProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label: ReactNode;
}

interface ChoiceBaseProps extends ChoiceProps {
  type: 'checkbox' | 'radio';
  shape: 'check' | 'radio' | 'switch';
}

/** 네이티브 input을 그대로 두고 모양만 그린다. 키보드·폼 동작은 브라우저 기본값을 따른다. */
function ChoiceBase({
  type,
  shape,
  label,
  className,
  ...rest
}: ChoiceBaseProps) {
  return (
    <label className={['choice', className].filter(Boolean).join(' ')}>
      <input type={type} className="choice__input visually-hidden" {...rest} />
      <span
        className={`choice__box choice__box--${shape}`}
        aria-hidden="true"
      />
      <span className="choice__label">{label}</span>
    </label>
  );
}

export function Checkbox(props: ChoiceProps) {
  return <ChoiceBase type="checkbox" shape="check" {...props} />;
}

export function Radio(props: ChoiceProps) {
  return <ChoiceBase type="radio" shape="radio" {...props} />;
}

export function Switch(props: ChoiceProps) {
  return <ChoiceBase type="checkbox" role="switch" shape="switch" {...props} />;
}
