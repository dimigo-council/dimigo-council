import { createContext } from 'react';

/**
 * Icon size a kit component gives the icons inside it (Button 24/20/16, Chip 16, …).
 * The nearest provider wins, like an inherited CSS property.
 */
export const IconSizeContext = createContext<number | undefined>(undefined);

export const IconSize = IconSizeContext.Provider;
