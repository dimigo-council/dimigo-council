import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The API has no global prefix and shares paths such as /activities/:id with
 * the app's own pages, so the browser calls it under /api and the dev server
 * strips that prefix. The refresh and OAuth state cookies are scoped to
 * /auth/refresh and /auth on the API, so their paths get the same prefix.
 * A production reverse proxy needs the same two rules.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          cookiePathRewrite: {
            '/auth': '/api/auth',
            '/auth/refresh': '/api/auth/refresh',
          },
        },
      },
    },
  };
});
