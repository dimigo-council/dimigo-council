import type { SVGProps } from 'react';
import type { KitIcon } from './icon-type';

export type { KitIcon };

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** An icon export from `./icons`, e.g. `iconSearch`. */
  icon: KitIcon;
  /** Pixel size. Defaults to the size the parent kit component sets (--kit-icon-size), else 24. */
  size?: number;
  /** Accessible label. Without it the icon is decorative and hidden from screen readers. */
  label?: string;
}

/** DIMI UI KIT "Icon" component. Paths are exported from the kit at 24×24 and take the text color. */
export function Icon({
  icon,
  size,
  label,
  className,
  style,
  ...rest
}: IconProps) {
  const dimension = size ? `${size}px` : 'var(--kit-icon-size, 24px)';
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ? `kit-icon ${className}` : 'kit-icon'}
      style={{ width: dimension, height: dimension, ...style }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-icon={icon.name}
      {...rest}
    >
      <path d={icon.d} />
    </svg>
  );
}
