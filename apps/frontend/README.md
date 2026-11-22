# Frontend deployment

The frontend is a static Vite build. Set `VITE_API_BASE_URL` when building the image; setting it on the running Nginx container does not change the JavaScript bundle.

For a Dokploy **Dockerfile** application, use:

| Dokploy field | Value |
| --- | --- |
| Dockerfile Path | `apps/frontend/Dockerfile` |
| Docker Context Path | `.` (repository root) |
| Environment → Build Time Arguments | `VITE_API_BASE_URL=https://api-dev.kdmhs.org` |

Redeploy the frontend after changing the build argument. The default API base is `/api`, which needs a same-origin reverse proxy in production; the included Nginx configuration does not proxy it.

For a frontend on a different origin from the API, set `FRONTEND_ORIGIN` in the **backend application's Environment Variables** to the frontend's public origin, such as `https://app.example.com`, then redeploy the backend. Use only the scheme and host, without a path. The API allows credentialed requests from that origin. Authentication cookies use `SameSite=Lax`, so both public URLs should be HTTPS subdomains of the same site. `VITE_API_BASE_URL` is public client configuration, not a secret.
