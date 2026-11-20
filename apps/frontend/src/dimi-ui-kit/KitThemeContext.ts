import { createContext, useContext } from 'react';
import type { KitMode, KitTextScale } from './theme';

export interface KitThemeControls {
  /** The mode in use: the override if there is one, else the OS preference. */
  mode: KitMode;
  /** The explicit override, or null to follow `prefers-color-scheme`. */
  modeOverride: KitMode | null;
  setMode: (mode: KitMode | null) => void;
  /** Typography scale mode: 100, 135, 150 or 200 (%). */
  textScale: KitTextScale;
  setTextScale: (scale: KitTextScale) => void;
}

export const KitThemeContext = createContext<KitThemeControls | null>(null);

/** Reads and changes the kit's color mode and text scale. Use inside <KitThemeProvider>. */
export function useKitTheme(): KitThemeControls {
  const controls = useContext(KitThemeContext);
  if (!controls)
    throw new Error('useKitTheme must be used inside <KitThemeProvider>');
  return controls;
}
