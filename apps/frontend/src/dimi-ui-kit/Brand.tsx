import type { HTMLAttributes } from 'react';
import brandIndex from './brand/index.json';
import styled from 'styled-components';

// Every Logo/Symbol variant exported from the kit, inlined so it renders crisp at its drawn size.
const files = import.meta.glob<string>('./brand/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

type BrandSet = keyof typeof brandIndex;

export interface BrandMarkProps extends HTMLAttributes<HTMLSpanElement> {
  set: BrandSet;
  /** Kit "Style": color, mono or outlined (not every set has every style). */
  variant?: 'color' | 'mono' | 'outlined';
  /** Pixel size. The closest size drawn in the kit is used, scaled to fit. */
  size: number;
  /** Accessible name. Without it the mark is decorative. */
  label?: string;
}

function pick(set: BrandSet, variant: string, size: number) {
  const entries = Object.entries(brandIndex[set] as Record<string, string>)
    .map(([key, file]) => {
      const [style, drawn] = key.split('/');
      return { style, drawn: Number(drawn), file };
    })
    .filter((e) => e.style === variant);
  if (!entries.length) throw new Error(`${set} has no "${variant}" style`);
  // Prefer the smallest drawn size that is at least as big as requested.
  const bigger = entries
    .filter((e) => e.drawn >= size)
    .sort((a, b) => a.drawn - b.drawn);
  return (bigger[0] ?? entries.sort((a, b) => b.drawn - a.drawn)[0]).file;
}

const BrandRoot = styled.span`
  display: inline-flex;
  flex: none;

  > svg {
    display: block;
    width: auto;
    height: 100%;
  }
`;

/** A DIMI UI KIT brand mark (Logo/COUNCIL, Symbol/COUNCIL, Symbol/DIMIGO, Symbol/DIMIGOIN). */
export function BrandMark({
  set,
  variant = 'color',
  size,
  label,
  style,
  ...rest
}: BrandMarkProps) {
  const svg = files[`./brand/${pick(set, variant, size)}`];
  return (
    <BrandRoot
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ height: size, ...style }}
      // The SVG comes from the kit export in this repo, not from user input.
      dangerouslySetInnerHTML={{ __html: svg }}
      {...rest}
    />
  );
}

export const SymbolCouncil = (p: Omit<BrandMarkProps, 'set'>) => (
  <BrandMark set="Symbol/COUNCIL" {...p} />
);
export const LogoCouncil = (p: Omit<BrandMarkProps, 'set'>) => (
  <BrandMark set="Logo/COUNCIL" {...p} />
);
export const SymbolDimigo = (p: Omit<BrandMarkProps, 'set'>) => (
  <BrandMark set="Symbol/DIMIGO" {...p} />
);
export const SymbolDimigoin = (p: Omit<BrandMarkProps, 'set'>) => (
  <BrandMark set="Symbol/DIMIGOIN" {...p} />
);
