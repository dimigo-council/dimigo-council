import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  block?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  block = false,
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'sm' && 'btn--sm',
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={classes} {...rest} />;
}
