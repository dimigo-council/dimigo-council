import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { KitThemeContext, type KitThemeControls } from './KitThemeContext';
import { createKitTheme, type KitMode, type KitTextScale } from './theme';

const darkQuery = '(prefers-color-scheme: dark)';

const systemMode = (): KitMode =>
  typeof window !== 'undefined' && window.matchMedia(darkQuery).matches
    ? 'dark'
    : 'light';

export interface KitThemeProviderProps {
  /** Pins light or dark. Without it the OS preference is followed (and can be overridden with useKitTheme). */
  mode?: KitMode;
  textScale?: KitTextScale;
  children: ReactNode;
}

/**
 * Provides the DIMI UI KIT theme to styled-components. Light/dark follows `prefers-color-scheme`
 * (and its changes) unless overridden with `useKitTheme().setMode`.
 */
export function KitThemeProvider({
  mode: initialMode,
  textScale: initialScale = '100',
  children,
}: KitThemeProviderProps) {
  const [system, setSystem] = useState<KitMode>(systemMode);
  const [modeOverride, setMode] = useState<KitMode | null>(initialMode ?? null);
  const [textScale, setTextScale] = useState<KitTextScale>(initialScale);

  useEffect(() => {
    const query = window.matchMedia(darkQuery);
    const update = () => setSystem(query.matches ? 'dark' : 'light');
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const mode = modeOverride ?? system;
  const theme = useMemo(
    () => createKitTheme(mode, textScale),
    [mode, textScale],
  );
  const controls = useMemo<KitThemeControls>(
    () => ({ mode, modeOverride, setMode, textScale, setTextScale }),
    [mode, modeOverride, textScale],
  );

  return (
    <KitThemeContext.Provider value={controls}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </KitThemeContext.Provider>
  );
}
