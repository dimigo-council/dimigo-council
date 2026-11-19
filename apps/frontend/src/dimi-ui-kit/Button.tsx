import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type KitIcon } from './Icon';
import { cx } from './cx';

type Size = 'small' | 'medium' | 'large';
type Theme = 'grayscale' | 'accent' | 'negative';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  theme?: Theme;
  /** Primary = solid fill, Secondary = translucent fill. */
  variant?: 'primary' | 'secondary';
  leadingIcon?: KitIcon;
  trailingIcon?: KitIcon;
  fullWidth?: boolean;
  children?: ReactNode;
}

/** DIMI UI KIT "Button". */
export function Button({
  size = 'medium',
  theme = 'grayscale',
  variant = 'secondary',
  leadingIcon,
  trailingIcon,
  fullWidth,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('kit-button kit-interactive', className)}
      data-size={size}
      data-theme={theme}
      data-style={variant}
      data-inverted={
        theme === 'grayscale' && variant === 'primary' ? '' : undefined
      }
      data-full-width={fullWidth ? '' : undefined}
      {...rest}
    >
      {leadingIcon && <Icon icon={leadingIcon} />}
      {children}
      {trailingIcon && <Icon icon={trailingIcon} />}
    </button>
  );
}

export interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  theme?: Theme;
  /** The kit shows a Strong label by default and a Regular one in its inverted interaction mode. */
  weight?: 'strong' | 'regular';
  leadingIcon?: KitIcon;
  trailingIcon?: KitIcon;
  children?: ReactNode;
}

/** DIMI UI KIT "TextButton". */
export function TextButton({
  size = 'medium',
  theme = 'grayscale',
  weight = 'strong',
  leadingIcon,
  trailingIcon,
  className,
  type = 'button',
  children,
  ...rest
}: TextButtonProps) {
  return (
    <button
      type={type}
      className={cx('kit-text-button kit-interactive', className)}
      data-size={size}
      data-theme={theme}
      data-weight={weight === 'regular' ? 'regular' : undefined}
      {...rest}
    >
      {leadingIcon && <Icon icon={leadingIcon} />}
      {children}
      {trailingIcon && <Icon icon={trailingIcon} />}
    </button>
  );
}

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  icon: KitIcon;
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  size?: 'medium' | 'large';
  /** Badged adds a dot, BadgedText adds a count bubble; the others are filled squares. */
  theme?:
    'outline' | 'grayscale' | 'accent' | 'solid' | 'badged' | 'badgedText';
  /** Shown when theme is "badgedText". */
  count?: number | string;
}

/** DIMI UI KIT "IconButton". */
export function IconButton({
  icon,
  label,
  size = 'large',
  theme = 'grayscale',
  count,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx('kit-icon-button kit-interactive', className)}
      data-size={size}
      data-theme={theme}
      {...rest}
    >
      <Icon icon={icon} />
      {theme === 'badged' && (
        <span className="kit-icon-button-dot" aria-hidden />
      )}
      {theme === 'badgedText' && count !== undefined && (
        <span className="kit-icon-button-count">{count}</span>
      )}
    </button>
  );
}
