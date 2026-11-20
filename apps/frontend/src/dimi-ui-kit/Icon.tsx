import { useContext, type SVGProps } from 'react';
import styled from 'styled-components';
import type { KitIcon } from './icon-type';
import { IconSizeContext } from './IconSize';

export type { KitIcon };

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** An icon export from `./icons`, e.g. `iconSearch`. */
  icon: KitIcon;
  /** Pixel size. Defaults to the size the parent kit component sets, else 24. */
  size?: number;
  /** Accessible label. Without it the icon is decorative and hidden from screen readers. */
  label?: string;
}

/** The icon's <svg>. Use it as a selector (`${IconSvg}`) to style icons inside a component. */
export const IconSvg = styled.svg`
  display: inline-block;
  flex: none;
  fill: currentColor;
`;

/** DIMI UI KIT "Icon" component. Paths are exported from the kit at 24×24 and take the text color. */
export function Icon({ icon, size, label, style, ...rest }: IconProps) {
  const inherited = useContext(IconSizeContext);
  const dimension = `${size ?? inherited ?? 24}px`;
  return (
    <IconSvg
      viewBox="0 0 24 24"
      style={{ width: dimension, height: dimension, ...style }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-icon={icon.name}
      {...rest}
    >
      <path d={icon.d} />
    </IconSvg>
  );
}
