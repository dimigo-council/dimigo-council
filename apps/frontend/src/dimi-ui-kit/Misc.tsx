import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Icon, type KitIcon } from './Icon';
import { iconPersonFill, iconSchoolFill } from './icons.generated';
import { cx } from './cx';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Person is round; Classroom is a rounded square. */
  type?: 'person' | 'classroom';
  size?: 'small' | 'medium' | 'large';
  /** Kit Fill=Image. Without it the kit's Fill=Icon placeholder is shown. */
  src?: string;
  alt?: string;
}

/** DIMI UI KIT "Avatar". */
export function Avatar({
  type = 'person',
  size = 'medium',
  src,
  alt = '',
  className,
  ...rest
}: AvatarProps) {
  return (
    <span
      className={cx('kit-avatar', className)}
      data-type={type}
      data-size={size}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <Icon icon={type === 'person' ? iconPersonFill : iconSchoolFill} />
      )}
    </span>
  );
}

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  size?: 'small' | 'medium' | 'large';
}

/** DIMI UI KIT "Divider": 1px, 4px or 8px of Core/Line. */
export function Divider({ size = 'small', className, ...rest }: DividerProps) {
  return (
    <hr className={cx('kit-divider', className)} data-size={size} {...rest} />
  );
}

export interface OptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Kit "Activated". */
  selected?: boolean;
  subLabel?: ReactNode;
  children: ReactNode;
}

/** DIMI UI KIT "Option": a selectable card with an optional sub-label above the label. */
export function Option({
  selected = false,
  subLabel,
  className,
  type = 'button',
  children,
  ...rest
}: OptionProps) {
  return (
    <button
      type={type}
      role="radio"
      aria-checked={selected}
      className={cx('kit-option kit-interactive', className)}
      {...rest}
    >
      {subLabel && <span className="kit-option-sub">{subLabel}</span>}
      <span className="kit-option-label">{children}</span>
    </button>
  );
}

export interface SegmentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Kit "Activated". */
  selected?: boolean;
  leadingIcon?: KitIcon;
  children: ReactNode;
}

/** DIMI UI KIT "Segment": one tab of a SegmentedControl. */
export function Segment({
  selected = false,
  leadingIcon,
  className,
  type = 'button',
  children,
  ...rest
}: SegmentProps) {
  return (
    <button
      type={type}
      role="tab"
      aria-selected={selected}
      className={cx('kit-segment kit-interactive', className)}
      {...rest}
    >
      {leadingIcon && <Icon icon={leadingIcon} />}
      {children}
    </button>
  );
}
