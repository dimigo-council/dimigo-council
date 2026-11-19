import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../../dimi-ui-kit/index.ts';
import { iconCheck } from '../../dimi-ui-kit/icons';

/*
 * Form choices drawn with DIMI UI KIT visuals (Control, Segment, Chip) over native inputs,
 * so keyboard, form submission and arrow-key radio groups keep the browser's behavior.
 * ui.css mirrors the kit's checked styles onto `input:checked + .kit-*`.
 */

export interface ChoiceProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label: ReactNode;
}

type ControlLook = 'checkfill' | 'radio' | 'toggle';

function ControlBox({ look }: { look: ControlLook }) {
  return (
    <span
      className="kit-control ui-control"
      data-type={look}
      aria-hidden="true"
    >
      {look === 'checkfill' && <Icon icon={iconCheck} />}
    </span>
  );
}

function ChoiceBase({
  type,
  look,
  label,
  className,
  ...rest
}: ChoiceProps & { type: 'checkbox' | 'radio'; look: ControlLook }) {
  return (
    <label className={['ui-choice', className].filter(Boolean).join(' ')}>
      <input
        type={type}
        className="ui-choice__input visually-hidden"
        {...rest}
      />
      <ControlBox look={look} />
      <span className="ui-choice__label">{label}</span>
    </label>
  );
}

/** Kit Control Type=CheckFill. */
export function Checkbox(props: ChoiceProps) {
  return <ChoiceBase type="checkbox" look="checkfill" {...props} />;
}

/** Kit Control Type=Radio. */
export function Radio(props: ChoiceProps) {
  return <ChoiceBase type="radio" look="radio" {...props} />;
}

/** Kit Control Type=Toggle. */
export function Switch(props: ChoiceProps) {
  return <ChoiceBase type="checkbox" role="switch" look="toggle" {...props} />;
}

export interface ChoiceItem<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface ChoiceGroupProps<T extends string> {
  items: ChoiceItem<T>[];
  /** null이면 아무것도 고르지 않은 상태 */
  value: T | null;
  onChange: (value: T) => void;
  /** segmented: kit SegmentedControl 모양. chips: kit Chip 모양의 단일 선택 (건의 분류 등) */
  variant?: 'segmented' | 'chips';
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/** 한 번에 하나만 고르는 선택. 네이티브 라디오라 방향키로 움직인다. */
export function ChoiceGroup<T extends string>({
  items,
  value,
  onChange,
  variant = 'segmented',
  name,
  ...aria
}: ChoiceGroupProps<T>) {
  const generated = useId();
  const groupName = name ?? generated;
  const chips = variant === 'chips';

  return (
    <div
      className={
        chips
          ? 'ui-choice-group ui-choice-group--chips'
          : 'ui-choice-group kit-segmented-control-track'
      }
      role="radiogroup"
      {...aria}
    >
      {items.map((item) => (
        <label key={item.value} className="ui-choice-group__item">
          <input
            type="radio"
            className="ui-choice__input visually-hidden"
            name={groupName}
            value={item.value}
            checked={item.value === value}
            disabled={item.disabled}
            onChange={() => onChange(item.value)}
          />
          <span
            className={
              chips ? 'kit-chip kit-interactive' : 'kit-segment kit-interactive'
            }
            data-theme={chips ? 'outlined' : undefined}
          >
            {item.label}
          </span>
        </label>
      ))}
    </div>
  );
}

export interface OptionCardProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'title'
> {
  title: ReactNode;
  description?: ReactNode;
  /** radio: 같은 name끼리 하나만 고른다. checkbox: 여러 개를 고른다. */
  type?: 'radio' | 'checkbox';
}

/** 설명이 붙을 수 있는 큰 선택지: kit Option 카드 + Control. */
export function OptionCard({
  title,
  description,
  type = 'radio',
  className,
  ...rest
}: OptionCardProps) {
  return (
    <label className={['ui-option-card', className].filter(Boolean).join(' ')}>
      <input
        type={type}
        className="ui-choice__input visually-hidden"
        {...rest}
      />
      <ControlBox look={type === 'radio' ? 'radio' : 'checkfill'} />
      <span className="ui-option-card__text">
        <span className="ui-option-card__title">{title}</span>
        {description && (
          <span className="ui-option-card__description">{description}</span>
        )}
      </span>
    </label>
  );
}

/** 눌리지 않는 kit Control 그림 (체크 목록·응답 보기처럼 상태만 보여줄 때). */
export function ControlMark({
  type,
  checked,
}: {
  type: 'checkfill' | 'radio';
  checked: boolean;
}) {
  return (
    <span
      className="kit-control ui-control ui-control-mark"
      data-type={type}
      data-checked={checked ? '' : undefined}
      aria-hidden="true"
    >
      {type === 'checkfill' && <Icon icon={iconCheck} />}
    </span>
  );
}
