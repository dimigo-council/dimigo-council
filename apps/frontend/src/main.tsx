import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './dimi-ui-kit/tokens.css';
import './dimi-ui-kit/kit.css';
import './style.css';
import './components/ui/ui.css';
import './app/shell.css';
import { router } from './app/router.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
