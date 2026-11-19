// AI-written
// Generates apps/frontend/src/dimi-ui-kit/tokens.css from DIMI UI KIT variable values
import fs from 'node:fs';

const out =
  process.argv[2] ??
  new URL('../src/dimi-ui-kit/tokens.css', import.meta.url).pathname;
const v = (name) =>
  '--kit-' + name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');
const ref = (name) => `var(${v(name)})`;
const mix = (name, pct) =>
  `color-mix(in srgb, ${ref(name)} ${pct}%, transparent)`;

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

const val = (x) => (typeof x === 'string' ? ref(x) : mix(x[0], x[1]));
const block = (mode) =>
  Object.entries(semantic)
    .map(([k, pair]) => `  ${v(k)}: ${val(pair[mode])};`)
    .join('\n');

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
const typeBlock = (factor) =>
  typeNames
    .map((n, i) => {
      const s = +(sizes['100'][i] * factor).toFixed(2),
        l = +(lines['100'][i] * factor).toFixed(2);
      return `  ${v('size/' + n)}: ${s}px;\n  ${v('line-height/' + n)}: ${l}px;`;
    })
    .join('\n');

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

const css = `/*
 * DIMI UI KIT tokens — generated from the kit's Figma variables (file uZ34cJKP9YvpxDijYhRiSZ).
 * Names follow the Figma variable paths: "Core/Glyph/Primary" -> --kit-core-glyph-primary.
 * Do not edit by hand; change the kit and regenerate.
 */

:root {
${Object.entries(primitives)
  .map(([k, x]) => `  ${v(k)}: ${x};`)
  .join('\n')}

  /* Color · Light */
${block(0)}

  /* Typography · Style */
  --kit-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --kit-weight-weak: 400;
  --kit-weight-regular: 500;
  --kit-weight-strong: 700; /* text styles render Bold; the Style variable Weight/Strong says 600 */

  /* Typography · 100% */
${typeBlock(1)}

  /* Component · Radius, Spacing, Height */
${Object.entries(component)
  .map(([k, x]) => `  ${v(k)}: ${x}px;`)
  .join('\n')}

  /* Atom */
${Object.entries(atom)
  .map(([k, x]) => `  ${v(k)}: ${ref(x)};`)
  .join('\n')}

  /* Effects */
  --kit-shadow-floating: 0 4px 24px 0 var(--kit-core-shadow);
}

/* Color · Dark: follows the OS unless the page pins data-theme="light". */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    color-scheme: dark;
${block(1).replace(/^ {2}/gm, '    ')}
  }
}

:root[data-theme='dark'] {
  color-scheme: dark;
${block(1)}
}

/* Typography scale modes: set data-text-scale on <html> or any container. */
${Object.entries(scales)
  .map(([m, f]) => `[data-text-scale='${m}'] {\n${typeBlock(f)}\n}`)
  .join('\n\n')}

/* Text styles */
${styleRows
  .map(
    ([name, key, w, ls]) => `.kit-text-${name.toLowerCase().replace('/', '-')} {
  font-family: var(--kit-family);
  font-size: var(${v('size/' + key)});
  line-height: var(${v('line-height/' + key)});
  font-weight: ${w};
  letter-spacing: ${ls / 100}em;
}`,
  )
  .join('\n\n')}
`;

fs.writeFileSync(out, css);
console.log('wrote', out, css.length);
