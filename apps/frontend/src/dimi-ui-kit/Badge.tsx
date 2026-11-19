import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Icon, type KitIcon } from './Icon';
import { iconClose } from './icons.generated';
import { cx } from './cx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'small' | 'large';
  /** Solid is the kit's name for the blue (Info) badge. */
  theme?: 'grayscale' | 'accent' | 'negative' | 'solid';
  leadingIcon?: KitIcon;
  children?: ReactNode;
}

/** DIMI UI KIT "Badge". */
export function Badge({
  size = 'large',
  theme = 'grayscale',
  leadingIcon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx('kit-badge', className)}
      data-size={size}
      data-theme={theme}
      {...rest}
    >
      {leadingIcon && <Icon icon={leadingIcon} />}
      {children}
    </span>
  );
}

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: 'outlined' | 'grayscale' | 'accent' | 'solid';
  /** Kit "Status": the chip is on. */
  selected?: boolean;
  leadingIcon?: KitIcon;
  /** Shows the kit's trailing close icon and calls this when it's clicked. */
  onRemove?: () => void;
  removeLabel?: string;
  children?: ReactNode;
}

/**
 * DIMI UI KIT "Chip". A toggle button; pass `selected` for its on state.
 * With `onRemove`, the chip becomes a group of two buttons (label + close) so no button is nested.
 */
export function Chip({
  theme = 'outlined',
  selected = false,
  leadingIcon,
  onRemove,
  removeLabel = '삭제',
  className,
  type = 'button',
  children,
  ...rest
}: ChipProps) {
  const content = (
    <>
      {leadingIcon && <Icon icon={leadingIcon} />}
      {children}
    </>
  );
  if (!onRemove) {
    return (
      <button
        type={type}
        aria-pressed={selected}
        className={cx('kit-chip kit-interactive', className)}
        data-theme={theme}
        {...rest}
      >
        {content}
      </button>
    );
  }
  return (
    <span
      className={cx('kit-chip', className)}
      data-theme={theme}
      data-selected={selected ? '' : undefined}
    >
      <button
        type={type}
        aria-pressed={selected}
        className="kit-reset-button kit-chip-label kit-interactive"
        {...rest}
      >
        {content}
      </button>
      <button
        type="button"
        aria-label={removeLabel}
        className="kit-reset-button kit-chip-trailing kit-interactive"
        onClick={onRemove}
      >
        <Icon icon={iconClose} />
      </button>
    </span>
  );
}
