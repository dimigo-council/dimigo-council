/*
 * Shared DIMI UI KIT style mixins. Values mirror the kit's component variants in Figma
 * (file uZ34cJKP9YvpxDijYhRiSZ) and all come from the theme.
 */
import { css, type DefaultTheme } from 'styled-components';

type RadiusKey = keyof DefaultTheme['radius'];

export interface InteractiveOptions {
  /** How far the overlay reaches past the element (CSS `inset`). */
  inset?: string;
  /** Overlay corner radius; defaults to the element's own. */
  radius?: RadiusKey;
  /** Interaction/Inverted: for content on an inverted fill. */
  inverted?: boolean;
}

/** Interaction overlay (kit component "Interaction"): hover 8%, focus 12%, pressed 16%. */
export const interactive = (
  t: DefaultTheme,
  { inset = '0', radius, inverted = false }: InteractiveOptions = {},
) => {
  const i = inverted
    ? t.colors.components.interaction.inverted
    : t.colors.components.interaction;
  return css`
    position: relative;
    isolation: isolate;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &::after {
      content: '';
      position: absolute;
      inset: ${inset};
      border-radius: ${radius ? t.radius[radius] : 'inherit'};
      background: transparent;
      pointer-events: none;
      transition: background-color 120ms ease;
    }
    &:hover::after {
      background: ${i.hover};
    }
    &:focus-visible {
      outline: none;
    }
    &:focus-visible::after {
      background: ${i.focused};
      box-shadow: 0 0 0 2px ${t.colors.core.status.accent};
    }
    &:active::after {
      background: ${i.pressed};
    }
    &:disabled,
    &[aria-disabled='true'] {
      cursor: not-allowed;
    }
    &:disabled::after,
    &[aria-disabled='true']::after {
      display: none;
    }
  `;
};

/** Strips a <button> down so a component can draw it. */
export const resetButton = css`
  margin: 0;
  border: 0;
  padding: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: inherit;
  appearance: none;
`;
