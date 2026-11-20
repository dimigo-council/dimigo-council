import { createGlobalStyle } from 'styled-components';

/** Page reset and base type (Pretendard is loaded by index.html). Replaces the old style.css. */
export const KitGlobalStyle = createGlobalStyle`
  :root {
    ${({ theme }) => theme.mode === 'dark' && 'color-scheme: dark;'}
    font-family: ${({ theme }) => theme.font.family};
    color: ${({ theme }) => theme.colors.core.glyph.primary};
    background: ${({ theme }) => theme.colors.background.secondary};
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
  }
`;
