import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css, type DefaultTheme } from 'styled-components';
import { Icon, IconSvg, type KitIcon } from './Icon';
import { IconSize } from './IconSize';
import { interactive } from './styles';

type Size = 'small' | 'medium' | 'large';
type Theme = 'grayscale' | 'accent' | 'negative';

const iconSizes: Record<Size, number> = { large: 24, medium: 20, small: 16 };

/* ---------- Button ---------- */

export interface ButtonLook {
  size?: Size;
  theme?: Theme;
  /** Primary = solid fill, Secondary = translucent fill. */
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

/**
 * The kit Button's look, including its Interaction overlay. Also used to draw links
 * and labels as buttons (see `ButtonLink` in the app).
 */
export const buttonStyles = (
  t: DefaultTheme,
  {
    size = 'medium',
    theme = 'grayscale',
    variant = 'secondary',
    fullWidth = false,
  }: ButtonLook,
) => {
  const c = t.colors;
  const sizes = {
    large: css`
      gap: ${t.spacing[200]};
      padding: ${t.spacing[400]} ${t.spacing[500]};
      border-radius: ${t.radius.m};
      font-size: ${t.font.size.body};
      line-height: ${t.font.lineHeight.body};
    `,
    medium: css`
      gap: ${t.spacing[150]};
      padding: ${t.spacing[300]} ${t.spacing[400]};
      border-radius: ${t.radius.m};
      font-size: ${t.font.size.callout};
      line-height: ${t.font.lineHeight.callout};
    `,
    small: css`
      gap: ${t.spacing[100]};
      padding: ${t.spacing[150]} ${t.spacing[300]};
      border-radius: ${t.radius.s};
      font-size: ${t.font.size.footnote};
      line-height: ${t.font.lineHeight.footnote};
    `,
  };
  const fills = {
    grayscale: {
      secondary: [c.components.translucent.secondary, c.core.glyph.primary],
      primary: [
        c.components.fill.inverted.primary,
        c.core.glyph.inverted.primary,
      ],
    },
    accent: {
      secondary: [c.core.status.translucent.accent, c.core.status.accent],
      primary: [c.core.status.accent, c.core.onColor.primary],
    },
    negative: {
      secondary: [c.core.status.translucent.negative, c.core.status.negative],
      primary: [c.core.status.negative, c.core.onColor.primary],
    },
  };
  const [background, color] = fills[theme][variant];
  return css`
    ${interactive(t, {
      inverted: theme === 'grayscale' && variant === 'primary',
    })}
    display: ${fullWidth ? 'flex' : 'inline-flex'};
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border: 0;
    margin: 0;
    font-family: ${t.font.family};
    font-weight: ${t.font.weight.strong};
    letter-spacing: -0.02em;
    white-space: nowrap;
    text-decoration: none;
    appearance: none;
    ${sizes[size]}
    ${fullWidth && 'width: 100%;'}
    background: ${background};
    color: ${color};

    &:disabled,
    &[aria-disabled='true'] {
      opacity: 0.3;
    }
  `;
};

interface ButtonStyleProps {
  $size: Size;
  $theme: Theme;
  $variant: 'primary' | 'secondary';
  $fullWidth?: boolean;
}

/** The Button's <button>. Use it as a selector (`${ButtonRoot}`) to place buttons. */
export const ButtonRoot = styled.button<ButtonStyleProps>`
  ${({ theme: t, $size, $theme, $variant, $fullWidth }) =>
    buttonStyles(t, {
      size: $size,
      theme: $theme,
      variant: $variant,
      fullWidth: $fullWidth,
    })}
`;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonLook {
  leadingIcon?: KitIcon;
  trailingIcon?: KitIcon;
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
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <ButtonRoot
      type={type}
      $size={size}
      $theme={theme}
      $variant={variant}
      $fullWidth={fullWidth}
      {...rest}
    >
      <IconSize value={iconSizes[size]}>
        {leadingIcon && <Icon icon={leadingIcon} />}
        {children}
        {trailingIcon && <Icon icon={trailingIcon} />}
      </IconSize>
    </ButtonRoot>
  );
}

/* ---------- TextButton ---------- */

export interface TextButtonLook {
  size?: Size;
  theme?: Theme;
  /** The kit shows a Strong label by default and a Regular one in its inverted interaction mode. */
  weight?: 'strong' | 'regular';
}

/** The kit TextButton's look, including its Interaction overlay. */
export const textButtonStyles = (
  t: DefaultTheme,
  { size = 'medium', theme = 'grayscale', weight = 'strong' }: TextButtonLook,
) => {
  const sizes = {
    large: [t.spacing[200], t.font.size.body, t.font.lineHeight.body],
    medium: [t.spacing[150], t.font.size.callout, t.font.lineHeight.callout],
    small: [t.spacing[100], t.font.size.footnote, t.font.lineHeight.footnote],
  };
  const [gap, fontSize, lineHeight] = sizes[size];
  const colors = {
    grayscale: t.colors.core.glyph.primary,
    accent: t.colors.core.status.accent,
    negative: t.colors.core.status.negative,
  };
  return css`
    /* The overlay reaches 4px past the label, as in the kit. */
    ${interactive(t, { inset: '-4px', radius: 'xs' })}
    display: inline-flex;
    align-items: center;
    border: 0;
    margin: 0;
    padding: 0;
    background: none;
    font-family: ${t.font.family};
    letter-spacing: -0.02em;
    white-space: nowrap;
    text-decoration: none;
    appearance: none;
    gap: ${gap};
    font-size: ${fontSize};
    line-height: ${lineHeight};
    /* Interaction/Standard shows the Strong label; Interaction/Inverted shows Regular. */
    font-weight: ${
      weight === 'regular' ? t.font.weight.regular : t.font.weight.strong
    };
    color: ${colors[theme]};

    &:disabled,
    &[aria-disabled='true'] {
      opacity: 0.3;
    }
  `;
};

const TextButtonRoot = styled.button<{
  $size: Size;
  $theme: Theme;
  $weight: 'strong' | 'regular';
}>`
  ${({ theme: t, $size, $theme, $weight }) =>
    textButtonStyles(t, { size: $size, theme: $theme, weight: $weight })}
`;

export interface TextButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, TextButtonLook {
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
  type = 'button',
  children,
  ...rest
}: TextButtonProps) {
  return (
    <TextButtonRoot
      type={type}
      $size={size}
      $theme={theme}
      $weight={weight}
      {...rest}
    >
      <IconSize value={iconSizes[size]}>
        {leadingIcon && <Icon icon={leadingIcon} />}
        {children}
        {trailingIcon && <Icon icon={trailingIcon} />}
      </IconSize>
    </TextButtonRoot>
  );
}

/* ---------- IconButton ---------- */

type IconButtonTheme =
  'outline' | 'grayscale' | 'accent' | 'solid' | 'badged' | 'badgedText';

const IconButtonDot = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme }) => theme.colors.components.fill.inverted.primary};
`;

const IconButtonCount = styled.span`
  ${({ theme: t }) => css`
    position: absolute;
    top: -50%;
    left: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border-radius: ${t.radius.circle};
    background: ${t.colors.components.translucent.tertiary};
    color: ${t.colors.core.glyph.secondary};
    font-family: ${t.font.family};
    font-weight: ${t.font.weight.weak};
    letter-spacing: -0.02em;
  `}
`;

const IconButtonRoot = styled.button<{
  $size: 'medium' | 'large';
  $theme: IconButtonTheme;
}>`
  ${({ theme: t, $size, $theme }) => {
    const c = t.colors;
    const large = $size === 'large';
    const filled = ['outline', 'grayscale', 'accent', 'solid'].includes($theme);
    const fills: Partial<Record<IconButtonTheme, ReturnType<typeof css>>> = {
      outline: css`
        background: ${c.components.fill.primary};
        box-shadow: inset 0 0 0 1px ${c.core.outline};
      `,
      grayscale: css`
        background: ${c.components.translucent.primary};
      `,
      accent: css`
        background: ${c.core.status.accent};
        color: ${c.core.onColor.primary};
      `,
      solid: css`
        background: ${c.core.status.info};
        color: ${c.core.onColor.primary};
      `,
    };
    return css`
      ${interactive(t, { inset: '-2px', radius: large ? 's' : 'xs' })}
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border: 0;
      margin: 0;
      padding: 0;
      background: none;
      color: ${c.core.glyph.primary};
      appearance: none;
      ${
        filled &&
        css`
          padding: ${large ? t.spacing[150] : t.spacing[100]};
          border-radius: ${large ? t.radius.s : t.radius.xs};
        `
      }
      ${fills[$theme]}

      &:is(:disabled, [aria-disabled='true']) ${IconSvg} {
        opacity: 0.2;
      }
      ${IconButtonDot} {
        width: ${large ? '6px' : '4px'};
        height: ${large ? '6px' : '4px'};
      }
      ${IconButtonCount} {
        min-width: ${large ? '20px' : '16px'};
        height: ${large ? '20px' : '16px'};
        padding: ${large ? t.spacing[100] : `${t.spacing[50]} ${t.spacing[100]}`};
        font-size: ${large ? t.font.size.footnote : t.font.size.caption};
        line-height: ${
          large ? t.font.lineHeight.footnote : t.font.lineHeight.caption
        };
      }
    `;
  }}
`;

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  icon: KitIcon;
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  size?: 'medium' | 'large';
  /** Badged adds a dot, BadgedText adds a count bubble; the others are filled squares. */
  theme?: IconButtonTheme;
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
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <IconButtonRoot
      type={type}
      aria-label={label}
      $size={size}
      $theme={theme}
      {...rest}
    >
      <Icon icon={icon} size={size === 'large' ? 24 : 20} />
      {theme === 'badged' && <IconButtonDot aria-hidden />}
      {theme === 'badgedText' && count !== undefined && (
        <IconButtonCount>{count}</IconButtonCount>
      )}
    </IconButtonRoot>
  );
}
