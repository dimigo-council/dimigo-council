import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { KitGlobalStyle, KitThemeProvider } from './dimi-ui-kit/index.ts';
import { router } from './app/router.tsx';
import { AppGlobalStyle } from './app/shell.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KitThemeProvider>
      <KitGlobalStyle />
      <AppGlobalStyle />
      <RouterProvider router={router} />
    </KitThemeProvider>
  </StrictMode>,
);
