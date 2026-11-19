import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { Button, type ButtonProps } from './Button';
import { Icon, type KitIcon } from './Icon';
import { iconArrowBackIos } from './icons.generated';
import { Input, type InputProps } from './Input';
import { Option, Segment } from './Misc';
import { SymbolCouncil } from './Brand';
import { cx } from './cx';

/* ---------- Navigation/NavigationBar ---------- */

export interface NavigationAction {
  icon: KitIcon;
  label: string;
  onClick?: () => void;
}

export interface NavigationBarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  /** Page: back arrow + title. IndexText: title only. IndexLogo: council symbol. */
  type?: 'page' | 'index-text' | 'index-logo';
  title?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  primary?: NavigationAction;
  secondary?: NavigationAction;
}

/** DIMI UI KIT "Navigation/NavigationBar" (mobile top bar). */
export function NavigationBar({
  type = 'page',
  title,
  onBack,
  backLabel = '뒤로',
  primary,
  secondary,
  className,
  ...rest
}: NavigationBarProps) {
  const actions = [primary, secondary].filter((a): a is NavigationAction =>
    Boolean(a),
  );
  return (
    <header
      className={cx('kit-navigation-bar', className)}
      data-type={type}
      {...rest}
    >
      {type === 'page' && (
        <button
          type="button"
          className="kit-reset-button kit-navigation-bar-back kit-interactive"
          aria-label={backLabel}
          onClick={onBack}
        >
          <Icon icon={iconArrowBackIos} />
        </button>
      )}
      {type === 'index-logo' ? (
        <SymbolCouncil size={32} />
      ) : (
        <h1 className="kit-navigation-bar-title kit-text-title-strong">
          {title}
        </h1>
      )}
      {actions.length > 0 && (
        <div className="kit-navigation-bar-actions">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              aria-label={a.label}
              onClick={a.onClick}
              className="kit-reset-button kit-navigation-bar-action kit-interactive"
            >
              <Icon icon={a.icon} />
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

/* ---------- Control/SegmentedControl ---------- */

export interface SegmentItem<T extends string> {
  value: T;
  label: ReactNode;
  icon?: KitIcon;
}

export interface SegmentedControlProps<T extends string> {
  items: SegmentItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

/** DIMI UI KIT "Control/SegmentedControl" (Double … Septuple: any number of segments). */
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cx('kit-segmented-control', className)}>
      <div
        className="kit-segmented-control-track"
        role="tablist"
        aria-label={label}
      >
        {items.map((item) => (
          <Segment
            key={item.value}
            selected={item.value === value}
            leadingIcon={item.icon}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </Segment>
        ))}
      </div>
    </div>
  );
}

/* ---------- Control/OptionPicker ---------- */

export interface OptionPickerItem<T extends string> {
  value: T;
  label: ReactNode;
  subLabel?: ReactNode;
}

export interface OptionPickerProps<T extends string> {
  items: OptionPickerItem<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Horizontal stacks the options vertically, as the kit's "Double Horizontal" does. */
  direction?: 'row' | 'column';
  label?: string;
  className?: string;
}

/** DIMI UI KIT "Control/OptionPicker". */
export function OptionPicker<T extends string>({
  items,
  value,
  onChange,
  direction = 'row',
  label,
  className,
}: OptionPickerProps<T>) {
  return (
    <div
      className={cx('kit-option-picker', className)}
      data-direction={direction}
      role="radiogroup"
      aria-label={label}
    >
      {items.map((item) => (
        <Option
          key={item.value}
          selected={item.value === value}
          subLabel={item.subLabel}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Option>
      ))}
    </div>
  );
}

/* ---------- Input/InputField ---------- */

export interface InputFieldProps extends Omit<InputProps, 'title'> {
  title?: ReactNode;
  /** Helper text under the input. Shown in Negative when `error` is set. */
  subLabel?: ReactNode;
}

/** DIMI UI KIT "Input/InputField" (Type=Single): title, input and helper text. */
export function InputField({
  title,
  subLabel,
  error,
  id,
  className,
  ...rest
}: InputFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = subLabel ? `${inputId}-help` : undefined;
  return (
    <div className={cx('kit-input-field-group', className)}>
      {title && (
        <label
          htmlFor={inputId}
          className="kit-input-field-title kit-text-callout-regular"
        >
          {title}
        </label>
      )}
      <Input id={inputId} error={error} aria-describedby={helpId} {...rest} />
      {subLabel && (
        <p
          id={helpId}
          className="kit-input-field-sub kit-text-footnote-weak"
          data-error={error ? '' : undefined}
          style={{ margin: 0 }}
        >
          {subLabel}
        </p>
      )}
    </div>
  );
}

export interface InputFieldDoubleProps {
  title?: ReactNode;
  subLabel?: ReactNode;
  first: InputProps & { 'aria-label': string };
  second: InputProps & { 'aria-label': string };
  className?: string;
}

/** DIMI UI KIT "Input/InputField" (Type=Double): two inputs side by side. */
export function InputFieldDouble({
  title,
  subLabel,
  first,
  second,
  className,
}: InputFieldDoubleProps) {
  return (
    <div className={cx('kit-input-field-group', className)} role="group">
      {title && (
        <span className="kit-input-field-title kit-text-callout-regular">
          {title}
        </span>
      )}
      <div className="kit-input-field-row">
        <Input {...first} />
        <Input {...second} />
      </div>
      {subLabel && (
        <span className="kit-input-field-sub kit-text-footnote-weak">
          {subLabel}
        </span>
      )}
    </div>
  );
}

/* ---------- Inform/Toast ---------- */

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  icon?: KitIcon;
  children: ReactNode;
}

/** DIMI UI KIT "Inform/Toast". Positioning and timing are up to the caller. */
export function Toast({ icon, className, children, ...rest }: ToastProps) {
  return (
    <div role="status" className={cx('kit-toast', className)} {...rest}>
      {icon && <Icon icon={icon} />}
      <span className="kit-text-callout-regular">{children}</span>
    </div>
  );
}

/* ---------- Inform/Header ---------- */

export interface HeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title' | 'content'
> {
  size?: 'large' | 'small';
  subTitle?: ReactNode;
  title: ReactNode;
  content?: ReactNode;
  /** Heading level for the title. */
  as?: 'h1' | 'h2' | 'h3';
}

/** DIMI UI KIT "Inform/Header". */
export function Header({
  size = 'large',
  subTitle,
  title,
  content,
  as: Heading = 'h2',
  className,
  ...rest
}: HeaderProps) {
  const large = size === 'large';
  return (
    <header className={cx('kit-header', className)} {...rest}>
      {subTitle && (
        <span
          className={cx(
            'kit-header-sub',
            large ? 'kit-text-footnote-weak' : 'kit-text-caption-weak',
          )}
        >
          {subTitle}
        </span>
      )}
      <Heading
        className={cx(
          'kit-header-title',
          large ? 'kit-text-headline-strong' : 'kit-text-body-strong',
        )}
      >
        {title}
      </Heading>
      {content && (
        <p
          className={cx(
            'kit-header-content',
            large ? 'kit-text-paragraph-large' : 'kit-text-paragraph-small',
          )}
        >
          {content}
        </p>
      )}
    </header>
  );
}

/* ---------- Inform/SectionHeader ---------- */

export interface SectionHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  size?: 'small' | 'medium' | 'large';
  title: ReactNode;
  leftIcon?: KitIcon;
  rightIcon?: KitIcon;
  /** Type=Value: text on the right. */
  value?: ReactNode;
  /** Type=Custom: any element on the right (e.g. a TextButton). */
  trailing?: ReactNode;
  as?: 'h2' | 'h3' | 'h4';
}

/** DIMI UI KIT "Inform/SectionHeader". */
export function SectionHeader({
  size = 'medium',
  title,
  leftIcon,
  rightIcon,
  value,
  trailing,
  as: Heading = 'h2',
  className,
  ...rest
}: SectionHeaderProps) {
  const titleStyle =
    size === 'large'
      ? 'kit-text-title-strong'
      : size === 'medium'
        ? 'kit-text-headline-strong'
        : 'kit-text-callout-regular';
  const valueStyle =
    size === 'small' ? 'kit-text-footnote-weak' : 'kit-text-callout-regular';
  return (
    <div
      className={cx('kit-section-header', className)}
      data-size={size}
      {...rest}
    >
      <Heading className={cx('kit-section-header-title', titleStyle)}>
        {leftIcon && <Icon icon={leftIcon} />}
        {title}
        {rightIcon && <Icon icon={rightIcon} />}
      </Heading>
      {value !== undefined && (
        <span className={cx('kit-section-header-value', valueStyle)}>
          {value}
        </span>
      )}
      {trailing && (
        <span className="kit-section-header-trailing">{trailing}</span>
      )}
    </div>
  );
}

/* ---------- List/ValueList ---------- */

export interface ValueListProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'title' | 'content'
> {
  /** Horizontal: one line (sub-title, title, value). Vertical: title row over a paragraph. */
  direction?: 'row' | 'column';
  /** Outlined (default), Active (accent fill) or Disabled. */
  theme?: 'outlined' | 'active' | 'disabled';
  title: ReactNode;
  subTitle?: ReactNode;
  content?: ReactNode;
}

/** DIMI UI KIT "List/ValueList". Renders a button when onClick is given, else a plain block. */
export function ValueList({
  direction = 'row',
  theme = 'outlined',
  title,
  subTitle,
  content,
  className,
  onClick,
  ...rest
}: ValueListProps) {
  const row = direction === 'row';
  const body = row ? (
    <>
      {subTitle && (
        <span className="kit-value-list-sub kit-text-callout-weak">
          {subTitle}
        </span>
      )}
      <span className="kit-value-list-title kit-text-body-strong">{title}</span>
      {content && (
        <span className="kit-value-list-content kit-text-callout-regular">
          {content}
        </span>
      )}
    </>
  ) : (
    <>
      <span className="kit-value-list-head">
        <span className="kit-value-list-title kit-text-headline-strong">
          {title}
        </span>
        {subTitle && (
          <span className="kit-value-list-sub kit-text-footnote-weak">
            {subTitle}
          </span>
        )}
      </span>
      {content && (
        <span className="kit-value-list-content kit-text-paragraph-small">
          {content}
        </span>
      )}
    </>
  );
  return (
    <div
      className={cx('kit-value-list', className)}
      data-direction={direction}
      data-theme={theme}
    >
      {onClick ? (
        <button
          type="button"
          className="kit-reset-button kit-value-list-card kit-interactive"
          disabled={theme === 'disabled'}
          aria-pressed={theme === 'active'}
          onClick={onClick}
          {...rest}
        >
          {body}
        </button>
      ) : (
        <div className="kit-value-list-card">{body}</div>
      )}
    </div>
  );
}

/* ---------- List/ItemList ---------- */

export interface ItemListProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title' | 'content'
> {
  size?: 'large' | 'small';
  title: ReactNode;
  subTitle?: ReactNode;
  content?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}

/** DIMI UI KIT "List/ItemList". */
export function ItemList({
  size = 'large',
  title,
  subTitle,
  content,
  leading,
  trailing,
  onClick,
  className,
  ...rest
}: ItemListProps) {
  const large = size === 'large';
  const inner = (
    <>
      {leading && <span className="kit-item-list-leading">{leading}</span>}
      <span className="kit-item-list-body">
        {subTitle && (
          <span
            className={cx(
              'kit-item-list-sub',
              large ? 'kit-text-callout-regular' : 'kit-text-footnote-weak',
            )}
          >
            {subTitle}
          </span>
        )}
        <span
          className={cx(
            'kit-item-list-title',
            large ? 'kit-text-headline-strong' : 'kit-text-body-strong',
          )}
        >
          {title}
        </span>
        {content && (
          <span
            className={cx(
              'kit-item-list-content',
              large ? 'kit-text-paragraph-large' : 'kit-text-paragraph-small',
            )}
          >
            {content}
          </span>
        )}
      </span>
      {trailing && <span className="kit-item-list-trailing">{trailing}</span>}
    </>
  );
  return onClick ? (
    <button
      type="button"
      className={cx(
        'kit-reset-button kit-item-list kit-interactive',
        className,
      )}
      data-size={size}
      onClick={onClick}
    >
      {inner}
    </button>
  ) : (
    <div className={cx('kit-item-list', className)} data-size={size} {...rest}>
      {inner}
    </div>
  );
}

/* ---------- Button/ButtonGroup and Button/ActionButton ---------- */

export interface ButtonGroupProps {
  /** Buttons in order. Their size/theme/variant are fixed by the group type. */
  buttons: Array<Omit<ButtonProps, 'size' | 'theme' | 'variant' | 'fullWidth'>>;
  /** Vertical stacks each button on its own row ("Double Horizontal" in the kit). */
  direction?: 'row' | 'column';
  subLabel?: ReactNode;
  className?: string;
}

/** DIMI UI KIT "Button/ButtonGroup": Medium · Grayscale · Secondary buttons with an optional sub-label. */
export function ButtonGroup({
  buttons,
  direction = 'row',
  subLabel,
  className,
}: ButtonGroupProps) {
  const items = buttons.map((b, i) => (
    <Button
      key={i}
      size="medium"
      theme="grayscale"
      variant="secondary"
      fullWidth
      {...b}
    />
  ));
  return (
    <div className={cx('kit-button-group', className)}>
      {direction === 'row' ? (
        <div className="kit-button-group-row">{items}</div>
      ) : (
        items
      )}
      {subLabel && (
        <span className="kit-button-group-sub kit-text-footnote-weak">
          {subLabel}
        </span>
      )}
    </div>
  );
}

export interface ActionButtonProps {
  primary: Omit<ButtonProps, 'size' | 'theme' | 'variant' | 'fullWidth'>;
  secondary?: Omit<ButtonProps, 'size' | 'theme' | 'variant' | 'fullWidth'>;
  direction?: 'row' | 'column';
  subLabel?: ReactNode;
  className?: string;
}

/** DIMI UI KIT "Button/ActionButton": the Large Accent call to action, optionally with a secondary. */
export function ActionButton({
  primary,
  secondary,
  direction = 'row',
  subLabel,
  className,
}: ActionButtonProps) {
  const main = (
    <Button
      size="large"
      theme="accent"
      variant="primary"
      fullWidth
      {...primary}
    />
  );
  const alt = secondary && (
    <Button
      size="large"
      theme="accent"
      variant="secondary"
      fullWidth
      {...secondary}
    />
  );
  return (
    <div className={cx('kit-button-group', className)}>
      {direction === 'row' && alt ? (
        <div className="kit-button-group-row">
          {main}
          {alt}
        </div>
      ) : (
        <>
          {main}
          {alt}
        </>
      )}
      {subLabel && (
        <span className="kit-button-group-sub kit-text-footnote-weak">
          {subLabel}
        </span>
      )}
    </div>
  );
}
