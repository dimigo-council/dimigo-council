import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { KitGlobalStyle, KitThemeProvider } from './dimi-ui-kit/index.ts';
import { onSessionEnd, restoreSession } from './app/session.ts';
import { AppGlobalStyle } from './app/shell.ts';

// 라우트 가드가 로그인 상태를 알 수 있게, 라우터가 첫 화면의 로더를 돌리기 전에 세션을 되살린다.
// 라우터는 만들어지는 순간 첫 화면을 불러오므로 세션을 되살린 뒤에 불러온다.
await restoreSession();
const { router } = await import('./app/router.tsx');

// 리프레시 토큰이 만료되거나 취소되면 로그인 화면으로 보낸다.
onSessionEnd(() => {
  const { pathname } = router.state.location;
  if (!/^\/(login|signup|landing|terms|privacy|google)/.test(pathname)) {
    void router.navigate('/login', { replace: true });
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KitThemeProvider>
      <KitGlobalStyle />
      <AppGlobalStyle />
      <RouterProvider router={router} />
    </KitThemeProvider>
  </StrictMode>,
);
