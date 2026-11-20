import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import styled, { css, type DefaultTheme } from 'styled-components';
import { Icon, type KitIcon } from './Icon';
import { IconSize } from './IconSize';
import { iconClose } from './icons.generated';
import { interactive, resetButton } from './styles';

/* ---------- Badge ---------- */

type BadgeTheme = 'grayscale' | 'accent' | 'negative' | 'solid';

/** The Badge's <span>. Use it as a selector (`${BadgeRoot}`) to place badges. */
export const BadgeRoot = styled.span<{
  $size: 'small' | 'large';
  $theme: BadgeTheme;
}>`
  ${({ theme: t, $size, $theme }) => {
    const c = t.colors;
    const fills: Record<BadgeTheme, [string, string]> = {
      grayscale: [c.components.translucent.tertiary, c.core.glyph.secondary],
      accent: [c.core.status.translucent.accent, c.core.status.accent],
      negative: [c.core.status.translucent.negative, c.core.status.negative],
      solid: [c.core.status.translucent.info, c.core.status.info],
    };
    return css`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border-radius: ${t.radius['2xs']};
      font-family: ${t.font.family};
      font-weight: ${t.font.weight.weak};
      letter-spacing: -0.02em;
      white-space: nowrap;
      ${
        $size === 'large'
          ? css`
              gap: ${t.spacing[100]};
              padding: ${t.spacing[50]} ${t.spacing[150]};
              font-size: ${t.font.size.footnote};
              line-height: ${t.font.lineHeight.footnote};
            `
          : css`
              gap: ${t.spacing[50]};
              padding: ${t.spacing[50]} ${t.spacing[100]};
              font-size: ${t.font.size.caption};
              line-height: ${t.font.lineHeight.caption};
            `
      }
      background: ${fills[$theme][0]};
      color: ${fills[$theme][1]};
    `;
  }}
`;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'small' | 'large';
  /** Solid is the kit's name for the blue (Info) badge. */
  theme?: BadgeTheme;
  leadingIcon?: KitIcon;
  children?: ReactNode;
}

/** DIMI UI KIT "Badge". */
export function Badge({
  size = 'large',
  theme = 'grayscale',
  leadingIcon,
  children,
  ...rest
}: BadgeProps) {
  return (
    <BadgeRoot $size={size} $theme={theme} {...rest}>
      <IconSize value={size === 'large' ? 16 : 12}>
        {leadingIcon && <Icon icon={leadingIcon} />}
        {children}
      </IconSize>
    </BadgeRoot>
  );
}

/* ---------- Chip ---------- */

type ChipTheme = 'outlined' | 'grayscale' | 'accent' | 'solid';

const ChipTrailing = styled.button<{ $inherit: boolean }>`
  ${({ theme: t, $inherit }) => css`
    ${interactive(t, { inset: '-2px', radius: 'xs' })}
    ${resetButton}
    display: inline-flex;
    color: ${$inherit ? 'inherit' : t.colors.core.glyph.tertiary};
  `}
`;

export interface ChipLook {
  theme?: ChipTheme;
  /** Kit "Status": the chip is on. */
  selected?: boolean;
  /** The chip is a plain button (with its own overlay), not a label + close group. */
  interactive?: boolean;
}

/** The kit Chip's look. Also used to draw native radio labels as chips. */
export const chipStyles = (
  t: DefaultTheme,
  { theme = 'outlined', selected = false, interactive: own = true }: ChipLook,
) => {
  const c = t.colors;
  const looks: Record<
    ChipTheme,
    [off: ReturnType<typeof css>, on: ReturnType<typeof css>]
  > = {
    outlined: [
      css`
        background: transparent;
        box-shadow: inset 0 0 0 1px ${c.core.outline};
        color: ${c.core.glyph.secondary};
      `,
      css`
        background: ${c.components.fill.inverted.secondary};
        box-shadow: none;
        color: ${c.core.glyph.inverted.primary};
      `,
    ],
    grayscale: [
      css`
        background: ${c.components.translucent.primary};
        color: ${c.core.glyph.secondary};
      `,
      css`
        background: ${c.components.fill.inverted.secondary};
        box-shadow: none;
        color: ${c.core.glyph.inverted.primary};
      `,
    ],
    accent: [
      css`
        background: ${c.core.status.translucent.accent};
        color: ${c.core.status.accent};
      `,
      css`
        background: ${c.core.status.accent};
        color: ${c.core.onColor.primary};
      `,
    ],
    solid: [
      css`
        background: ${c.core.status.translucent.info};
        color: ${c.core.status.info};
      `,
      css`
        background: ${c.core.status.info};
        color: ${c.core.onColor.primary};
      `,
    ],
  };
  return css`
    ${own && interactive(t, { radius: 'xs' })}
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${t.spacing[150]};
    box-sizing: border-box;
    border: 0;
    margin: 0;
    padding: ${t.spacing[150]} ${t.spacing[300]};
    border-radius: ${t.radius.s};
    font-family: ${t.font.family};
    font-size: ${t.font.size.footnote};
    line-height: ${t.font.lineHeight.footnote};
    font-weight: ${selected ? t.font.weight.strong : t.font.weight.weak};
    letter-spacing: -0.02em;
    white-space: nowrap;
    appearance: none;
    ${looks[theme][0]}
    ${selected && looks[theme][1]}
  `;
};

const ChipRoot = styled.button<{ $theme: ChipTheme; $selected: boolean }>`
  ${({ theme: t, $theme, $selected }) =>
    chipStyles(t, { theme: $theme, selected: $selected })}
`;

const ChipGroup = styled.span<{ $theme: ChipTheme; $selected: boolean }>`
  ${({ theme: t, $theme, $selected }) =>
    chipStyles(t, { theme: $theme, selected: $selected, interactive: false })}
`;

const ChipLabel = styled.button`
  ${({ theme: t }) => css`
    ${interactive(t, { inset: '-6px -2px -6px -12px', radius: 'xs' })}
    ${resetButton}
    display: inline-flex;
    align-items: center;
    gap: ${t.spacing[150]};
  `}
`;

export interface ChipProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<ChipLook, 'interactive'> {
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
      <ChipRoot
        type={type}
        aria-pressed={selected}
        className={className}
        $theme={theme}
        $selected={selected}
        {...rest}
      >
        <IconSize value={16}>{content}</IconSize>
      </ChipRoot>
    );
  }
  return (
    <ChipGroup className={className} $theme={theme} $selected={selected}>
      <IconSize value={16}>
        <ChipLabel type={type} aria-pressed={selected} {...rest}>
          {content}
        </ChipLabel>
        <ChipTrailing
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          $inherit={selected || theme === 'accent' || theme === 'solid'}
        >
          <Icon icon={iconClose} />
        </ChipTrailing>
      </IconSize>
    </ChipGroup>
  );
}
