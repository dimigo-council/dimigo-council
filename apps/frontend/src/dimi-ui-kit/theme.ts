import type { CSSObject } from 'styled-components';
import {
  atom,
  createTextStyles,
  darkColors,
  fontFamily,
  fontWeight,
  height,
  lightColors,
  radius,
  spacing,
  typeScales,
  type KitTextScale,
  type KitTextStyle,
} from './theme.generated';

export type { KitColors, KitTextScale, KitTextStyle } from './theme.generated';

export type KitMode = 'light' | 'dark';

/** Builds the styled-components theme for one color mode and typography scale mode. */
export function createKitTheme(mode: KitMode, textScale: KitTextScale = '100') {
  const colors = mode === 'dark' ? darkColors : lightColors;
  const type = typeScales[textScale];
  return {
    mode,
    textScale,
    colors,
    font: {
      family: fontFamily,
      weight: fontWeight,
      size: type.size,
      lineHeight: type.lineHeight,
    },
    radius,
    spacing,
    height,
    atom,
    shadow: { floating: `0 4px 24px 0 ${colors.core.shadow}` },
    /** The 23 kit text styles (`text.bodyStrong`, …) as style objects. */
    text: createTextStyles(type),
  };
}

export type KitTheme = ReturnType<typeof createKitTheme>;

/** Interpolation for a kit text style: `${textStyle('bodyStrong')}`. */
export const textStyle =
  (name: KitTextStyle) =>
  ({ theme }: { theme: KitTheme }): CSSObject =>
    theme.text[name];
