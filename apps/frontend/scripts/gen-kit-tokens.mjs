// AI-written
// Generates apps/frontend/src/dimi-ui-kit/theme.generated.ts (the styled-components theme data)
// from DIMI UI KIT variable values.
import fs from 'node:fs';

const out =
  process.argv[2] ??
  new URL('../src/dimi-ui-kit/theme.generated.ts', import.meta.url).pathname;

const primitives = {
  'Primitive/Brand/200': '#ffcbe3',
  'Primitive/Brand/300': '#ffa6d2',
  'Primitive/Brand/400': '#fe74bf',
  'Primitive/Brand/Default': '#ff51b0',
  'Primitive/Brand/600': '#ed1380',
  'Primitive/Brand/700': '#c60363',
  'Primitive/Brand/DIMIGO': '#e83c77',
  'Primitive/Red/100': '#f9d6d6',
  'Primitive/Red/200': '#faafaf',
  'Primitive/Red/300': '#f77c7c',
  'Primitive/Red/400': '#ee5252',
  'Primitive/Red/Default': '#e43535',
  'Primitive/Red/600': '#c72e2e',
  'Primitive/Red/700': '#9d1515',
  'Primitive/Orange/100': '#ffe5bf',
  'Primitive/Orange/200': '#ffd699',
  'Primitive/Orange/300': '#ffc166',
  'Primitive/Orange/400': '#ffb13d',
  'Primitive/Orange/Default': '#ff9a05',
  'Primitive/Orange/600': '#e58406',
  'Primitive/Orange/700': '#c66d06',
  'Primitive/Yellow/100': '#fff3bf',
  'Primitive/Yellow/200': '#ffec99',
  'Primitive/Yellow/300': '#ffe570',
  'Primitive/Yellow/400': '#ffdc40',
  'Primitive/Yellow/Default': '#ffd105',
  'Primitive/Yellow/600': '#e7b900',
  'Primitive/Yellow/700': '#cca003',
  'Primitive/Green/100': '#c6f7d2',
  'Primitive/Green/200': '#9aedaf',
  'Primitive/Green/300': '#7be094',
  'Primitive/Green/400': '#4bd679',
  'Primitive/Green/Default': '#1ebd45',
  'Primitive/Green/600': '#0cb235',
  'Primitive/Green/700': '#06992a',
  'Primitive/Blue/100': '#bfe4ff',
  'Primitive/Blue/200': '#99d5ff',
  'Primitive/Blue/300': '#70c3ff',
  'Primitive/Blue/400': '#40afff',
  'Primitive/Blue/Default': '#0597ff',
  'Primitive/Blue/600': '#0474e3',
  'Primitive/Blue/700': '#0451d6',
  'Primitive/Neutral/0': '#ffffff',
  'Primitive/Neutral/50': '#fafafa',
  'Primitive/Neutral/100': '#f4f4f5',
  'Primitive/Neutral/200': '#e4e4e7',
  'Primitive/Neutral/300': '#d4d4d8',
  'Primitive/Neutral/400': '#a1a1aa',
  'Primitive/Neutral/500': '#71717a',
  'Primitive/Neutral/600': '#52525b',
  'Primitive/Neutral/700': '#3f3f46',
  'Primitive/Neutral/800': '#27272a',
  'Primitive/Neutral/900': '#18181b',
  'Primitive/Neutral/950': '#09090b',
  'Primitive/Neutral/1000': '#000000',
  'Primitive/Cool Neutral/0': '#ffffff',
  'Primitive/Cool Neutral/50': '#f6f6fa',
  'Primitive/Cool Neutral/100': '#e8ecf5',
  'Primitive/Cool Neutral/200': '#d8dced',
  'Primitive/Cool Neutral/300': '#c0c2da',
  'Primitive/Cool Neutral/400': '#9a9bbb',
  'Primitive/Cool Neutral/500': '#787a9c',
  'Primitive/Cool Neutral/600': '#5f607f',
  'Primitive/Cool Neutral/700': '#4a4a64',
  'Primitive/Cool Neutral/800': '#333347',
  'Primitive/Cool Neutral/900': '#20202e',
  'Primitive/Cool Neutral/950': '#12131d',
};

// Semantic colors: [light, dark]. A string is an alias; [name, pct] is an alias at that opacity.
const OP = 20; // Core/Status/Translucent/Opacity
const semantic = {
  'Core/Status/Accent': ['Primitive/Brand/DIMIGO', 'Primitive/Brand/DIMIGO'],
  'Core/Status/Negative': ['Primitive/Red/Default', 'Primitive/Red/Default'],
  'Core/Status/Warning': [
    'Primitive/Yellow/Default',
    'Primitive/Yellow/Default',
  ],
  'Core/Status/Positive': [
    'Primitive/Green/Default',
    'Primitive/Green/Default',
  ],
  'Core/Status/Info': ['Primitive/Blue/Default', 'Primitive/Blue/Default'],
  'Core/Status/Translucent/Accent': [
    ['Core/Status/Accent', OP],
    ['Core/Status/Accent', OP],
  ],
  'Core/Status/Translucent/Negative': [
    ['Primitive/Red/Default', OP],
    ['Primitive/Red/Default', OP],
  ],
  'Core/Status/Translucent/Warning': [
    ['Primitive/Yellow/Default', OP],
    ['Primitive/Yellow/Default', OP],
  ],
  'Core/Status/Translucent/Positive': [
    ['Primitive/Green/Default', OP],
    ['Primitive/Green/Default', OP],
  ],
  'Core/Status/Translucent/Info': [
    ['Core/Status/Info', OP],
    ['Core/Status/Info', OP],
  ],
  'Core/Glyph/Primary': ['Primitive/Cool Neutral/900', 'Primitive/Neutral/100'],
  'Core/Glyph/Secondary': [
    ['Core/Glyph/Primary', 70],
    ['Core/Glyph/Primary', 70],
  ],
  'Core/Glyph/Tertiary': [
    ['Core/Glyph/Primary', 50],
    ['Core/Glyph/Primary', 50],
  ],
  'Core/Glyph/Quaternary': [
    ['Core/Glyph/Primary', 30],
    ['Core/Glyph/Primary', 30],
  ],
  'Core/Glyph/Accent': ['Primitive/Brand/600', 'Primitive/Brand/600'],
  'Core/Glyph/Inverted/Primary': [
    'Primitive/Neutral/100',
    'Primitive/Cool Neutral/900',
  ],
  'Core/Glyph/Inverted/Secondary': [
    ['Core/Glyph/Inverted/Primary', 70],
    ['Core/Glyph/Inverted/Primary', 70],
  ],
  'Core/Glyph/Inverted/Tertiary': [
    ['Core/Glyph/Inverted/Primary', 50],
    ['Core/Glyph/Inverted/Primary', 50],
  ],
  'Core/Glyph/Inverted/Quaternary': [
    ['Core/Glyph/Inverted/Primary', 30],
    ['Core/Glyph/Inverted/Primary', 30],
  ],
  'Core/Glyph/Inverted/Accent': ['Primitive/Brand/600', 'Primitive/Brand/600'],
  'Core/OnColor/Primary': ['Primitive/Neutral/0', 'Primitive/Neutral/0'],
  'Core/OnColor/Secondary': [
    ['Core/OnColor/Primary', 85],
    ['Core/OnColor/Primary', 85],
  ],
  'Core/OnColor/Tertiary': [
    ['Core/OnColor/Primary', 70],
    ['Core/OnColor/Primary', 70],
  ],
  'Core/OnColor/Quaternary': [
    ['Core/OnColor/Primary', 50],
    ['Core/OnColor/Primary', 50],
  ],
  'Core/Line': [
    ['Primitive/Cool Neutral/500', 32],
    ['Primitive/Cool Neutral/500', 32],
  ],
  'Core/Outline': [
    ['Primitive/Cool Neutral/500', 12],
    ['Primitive/Cool Neutral/500', 24],
  ],
  'Core/Shadow': [
    ['Primitive/Neutral/1000', 6],
    ['Primitive/Neutral/1000', 40],
  ],
  'Background/Primary': [
    'Primitive/Cool Neutral/0',
    'Primitive/Cool Neutral/950',
  ],
  'Background/Secondary': [
    'Primitive/Cool Neutral/50',
    'Primitive/Cool Neutral/900',
  ],
  'Background/Tertiary': [
    'Primitive/Cool Neutral/200',
    'Primitive/Cool Neutral/800',
  ],
  'Background/Inverted/Primary': [
    'Primitive/Neutral/1000',
    'Primitive/Neutral/0',
  ],
  'Background/Inverted/Secondary': [
    'Primitive/Neutral/950',
    'Primitive/Cool Neutral/50',
  ],
  'Background/Inverted/Tertiary': [
    'Primitive/Neutral/900',
    'Primitive/Cool Neutral/200',
  ],
  'Components/Fill/Primary': [
    'Primitive/Neutral/100',
    'Primitive/Cool Neutral/900',
  ],
  'Components/Fill/Secondary': [
    'Primitive/Neutral/200',
    'Primitive/Cool Neutral/800',
  ],
  'Components/Fill/Tertiary': [
    'Primitive/Neutral/300',
    'Primitive/Cool Neutral/700',
  ],
  'Components/Fill/Inverted/Primary': [
    'Primitive/Cool Neutral/900',
    'Primitive/Neutral/100',
  ],
  'Components/Fill/Inverted/Secondary': [
    'Primitive/Cool Neutral/800',
    'Primitive/Neutral/200',
  ],
  'Components/Fill/Inverted/Tertiary': [
    'Primitive/Cool Neutral/700',
    'Primitive/Neutral/300',
  ],
  'Components/Interaction/Hover': [
    ['Core/Glyph/Primary', 8],
    ['Core/Glyph/Primary', 8],
  ],
  'Components/Interaction/Focused': [
    ['Core/Glyph/Primary', 12],
    ['Core/Glyph/Primary', 12],
  ],
  'Components/Interaction/Pressed': [
    ['Core/Glyph/Primary', 16],
    ['Core/Glyph/Primary', 16],
  ],
  'Components/Interaction/Inverted/Hover': [
    ['Core/Glyph/Inverted/Primary', 8],
    ['Core/Glyph/Inverted/Primary', 8],
  ],
  'Components/Interaction/Inverted/Focused': [
    ['Core/Glyph/Inverted/Primary', 12],
    ['Core/Glyph/Inverted/Primary', 12],
  ],
  'Components/Interaction/Inverted/Pressed': [
    ['Core/Glyph/Inverted/Primary', 16],
    ['Core/Glyph/Inverted/Primary', 16],
  ],
  'Components/Translucent/Primary': [
    ['Primitive/Cool Neutral/700', 24],
    ['Primitive/Cool Neutral/500', 28],
  ],
  'Components/Translucent/Secondary': [
    ['Primitive/Cool Neutral/700', 16],
    ['Primitive/Cool Neutral/500', 22],
  ],
  'Components/Translucent/Tertiary': [
    ['Primitive/Cool Neutral/700', 12],
    ['Primitive/Cool Neutral/500', 16],
  ],
  'Components/Translucent/Interactive': [
    ['Primitive/Neutral/0', 96],
    ['Primitive/Neutral/0', 12],
  ],
};

// Typography collection modes 100% / 135% / 150% / 200%
const typeNames = [
  'Display',
  'Title',
  'Headline',
  'Body',
  'Callout',
  'Footnote',
  'Caption',
  'Paragraph Large',
  'Paragraph Small',
];
const sizes = { 100: [48, 24, 20, 16, 14, 12, 10, 16, 14] };
const lines = { 100: [70, 34, 28, 24, 20, 18, 14, 28.8, 24] };
const scales = { 135: 1.35, 150: 1.5, 200: 2 };

const component = {
  'Radius/None': 0,
  'Radius/2XS': 2,
  'Radius/XS': 4,
  'Radius/S': 6,
  'Radius/M': 8,
  'Radius/L': 10,
  'Radius/XL': 12,
  'Radius/2XL': 14,
  'Radius/3XL': 16,
  'Radius/Circle': 1000,
  'Spacing/50': 2,
  'Spacing/100': 4,
  'Spacing/150': 6,
  'Spacing/200': 8,
  'Spacing/300': 12,
  'Spacing/400': 16,
  'Spacing/500': 20,
  'Spacing/550': 24,
  'Spacing/600': 28,
  'Spacing/700': 32,
  'Spacing/750': 36,
  'Spacing/800': 40,
  'Spacing/850': 48,
  'Spacing/900': 64,
  'Spacing/950': 72,
  'Spacing/1000': 80,
  'Height/100': 20,
  'Height/200': 32,
  'Height/300': 44,
  'Height/400': 56,
  'Height/500': 68,
  'Height/600': 80,
};
const atom = {
  'Button/Radius/Small': 'Radius/XS',
  'Button/Radius/Medium': 'Radius/S',
  'Button/Radius/Large': 'Radius/M',
  'Button/Height/Small': 'Height/200',
  'Button/Height/Medium': 'Height/300',
  'Button/Height/Large': 'Height/400',
};

// Text styles: [type key, weight]. Letter spacing is in percent of font size.
const weights = { Weak: 400, Regular: 500, Strong: 700 }; // as rendered by the kit's text styles (Regular / Medium / Bold)
const styleRows = [];
for (const [t, key, ls] of [
  ['Display', 'Display', -3],
  ['Title', 'Title', -2],
  ['Headline', 'Headline', -2],
  ['Body', 'Body', -2],
  ['Callout', 'Callout', -2],
  ['Footnote', 'Footnote', -2],
  ['Caption', 'Caption', -2],
])
  for (const w of ['Weak', 'Regular', 'Strong'])
    styleRows.push([
      `${t}/${w}`,
      key,
      weights[w],
      t === 'Display' && w === 'Strong' ? 0 : ls,
    ]);
styleRows.push(
  ['Paragraph/Small', 'Paragraph Small', 400, -3],
  ['Paragraph/Large', 'Paragraph Large', 400, -3],
);

/* ---------- Resolve ---------- */

// "Core/OnColor/Primary" -> ['core', 'onColor', 'primary']; "Primitive/Cool Neutral/50" -> ['primitive', 'coolNeutral', '50']
const camel = (seg) =>
  /^\d+$/.test(seg)
    ? seg
    : seg
        .split(/\s+/)
        .map((w) => (/^[A-Z0-9]+$/.test(w) ? w.toLowerCase() : w))
        .map((w, i) =>
          i === 0
            ? w.charAt(0).toLowerCase() + w.slice(1)
            : w.charAt(0).toUpperCase() + w.slice(1),
        )
        .join('');
const keyPath = (name) => name.split('/').map(camel);

const hexToRgb = (hex) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
// Resolves a color to [r, g, b, alpha]. A color-mix with transparent in sRGB keeps the
// channels and scales the alpha, so aliases at an opacity become concrete rgba values.
function resolve(x, mode) {
  if (typeof x !== 'string') {
    const [r, g, b, a] = resolve(x[0], mode);
    return [r, g, b, a * (x[1] / 100)];
  }
  if (x in primitives) return [...hexToRgb(primitives[x]), 1];
  if (x in semantic) return resolve(semantic[x][mode], mode);
  throw new Error(`unknown color ${x}`);
}
const format = ([r, g, b, a]) => {
  const alpha = +a.toFixed(4);
  if (alpha === 1)
    return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const setPath = (obj, path, value) => {
  let o = obj;
  for (const k of path.slice(0, -1)) o = o[k] ??= {};
  o[path.at(-1)] = value;
  return obj;
};

const colorSet = (mode) => {
  const o = {};
  for (const [k, hex] of Object.entries(primitives))
    setPath(o, keyPath(k), hex);
  for (const k of Object.keys(semantic))
    setPath(o, keyPath(k), format(resolve(k, mode)));
  return o;
};

const px = (n) => `${n}px`;
const typeScale = (factor) => {
  const size = {};
  const lineHeight = {};
  typeNames.forEach((n, i) => {
    size[camel(n)] = px(+(sizes['100'][i] * factor).toFixed(2));
    lineHeight[camel(n)] = px(+(lines['100'][i] * factor).toFixed(2));
  });
  return { size, lineHeight };
};

const group = (prefix) => {
  const o = {};
  for (const [k, x] of Object.entries(component))
    if (k.startsWith(prefix + '/'))
      o[camel(k.slice(prefix.length + 1))] = px(x);
  return o;
};
const atomObj = {};
for (const [k, x] of Object.entries(atom)) {
  const [g, n] = x.split('/');
  setPath(atomObj, keyPath(k), px(component[`${g}/${n}`]));
}

const textStyleKey = (name) =>
  camel(name.replace('/', ' ').replace(/\s+(\w)/g, (_, c) => c.toUpperCase()));

const ts = (value, indent = 0) =>
  JSON.stringify(value, null, 2)
    .replace(/"([A-Za-z_$][\w$]*)":/g, '$1:')
    .replace(/"/g, "'")
    .replace(/\n/g, '\n' + ' '.repeat(indent));

const typeModes = { 100: typeScale(1) };
for (const [m, f] of Object.entries(scales)) typeModes[m] = typeScale(f);

const code = `// Generated by scripts/gen-kit-tokens.mjs from the DIMI UI KIT Figma variables
// (file uZ34cJKP9YvpxDijYhRiSZ). Do not edit by hand; change the kit and regenerate.
// Names follow the Figma variable paths: "Core/Glyph/Primary" -> colors.core.glyph.primary.
import type { CSSObject } from 'styled-components';

/** Color · Light */
export const lightColors = ${ts(colorSet(0))};

export type KitColors = typeof lightColors;

/** Color · Dark */
export const darkColors: KitColors = ${ts(colorSet(1))};

export const fontFamily =
  "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

/** Text styles render Weak 400 / Regular 500 / Strong 700 (the Style variable Weight/Strong says 600). */
export const fontWeight = { weak: 400, regular: 500, strong: 700 } as const;

/** Typography collection modes: font sizes and line heights at 100%, 135%, 150% and 200%. */
export const typeScales = ${ts(typeModes)};

export type KitTextScale = keyof typeof typeScales;
export type KitTypeScale = (typeof typeScales)[KitTextScale];

export const radius = ${ts(group('Radius'))};

export const spacing = ${ts(group('Spacing'))};

export const height = ${ts(group('Height'))};

export const atom = ${ts(atomObj)};

/** The 23 kit text styles for one typography mode. Letter spacing is in em of the font size. */
export function createTextStyles(type: KitTypeScale) {
  return {
${styleRows
  .map(
    ([name, key, w, ls]) => `    ${textStyleKey(name)}: {
      fontFamily,
      fontSize: type.size.${camel(key)},
      lineHeight: type.lineHeight.${camel(key)},
      fontWeight: ${w},
      letterSpacing: '${ls / 100}em',
    },`,
  )
  .join('\n')}
  } satisfies Record<string, CSSObject>;
}

export type KitTextStyle = keyof ReturnType<typeof createTextStyles>;
`;

fs.writeFileSync(out, code);
console.log('wrote', out, code.length);
