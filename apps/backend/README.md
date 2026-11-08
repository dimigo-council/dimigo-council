# Backend

NestJS API for the Dimigo Council app.

## Setup

Run `npm install` from the repository root. Copy `.env.template` to `.env` in this directory and fill in the values before starting the API.

- `DATABASE_URL`: PostgreSQL connection string.
- `ACCESS_TOKEN_SECRET`: random secret of at least 32 bytes for signing access JWTs.
- `EMAIL_CODE_SECRET`: a different random secret of at least 32 bytes for hashing email codes.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: the Google OAuth web client for school sign-in.
- `GOOGLE_SIGNUP_REDIRECT_URI` and `GOOGLE_LOGIN_REDIRECT_URI`: frontend callback URLs; register both exact URLs as authorized redirect URIs for that Google client. For local development, use the `http://localhost:5173` values in `.env.template`.
- `GMAIL_SMTP_USER` and `GMAIL_APP_PASSWORD`: the sending Google account address and its app password. The server connects to `smtp.gmail.com` on port 465 using TLS.

Run `sh apps/backend/scripts/generate-secrets.sh` from the repository root to generate independent values for `ACCESS_TOKEN_SECRET` and `EMAIL_CODE_SECRET`, then paste them into `apps/backend/.env`.

The sender uses [Gmail SMTP](https://support.google.com/mail/answer/7104828?hl=en-GB) with [Google's app password](https://support.google.com/accounts/answer/185833?hl=en). Keep the app password and both application secrets out of Git.

Apply migrations with `npm --workspace @dimigo-council/backend run db:migrate`, then start the API with `npm --workspace @dimigo-council/backend run dev`. Migration `0001` removes password hashes and revokes existing sessions as part of the switch to email codes and JWT access tokens.

## Authentication API

All routes are under `/auth`. Email sign-up and login use a school email address and a six-digit code sent through Gmail. Codes expire after 10 minutes, allow five attempts, and have a one-minute resend cooldown per address and purpose.

| Route | Purpose |
| --- | --- |
| `GET /signup/google` and `GET /login/google` | Return `{ url }` for the client to open and set an OAuth state cookie. |
| `POST /signup/google/callback` and `POST /login/google/callback` | Exchange Google's `code`, `state`, and optional `iss` response parameters from the frontend for app tokens. |
| `POST /signup/email` and `POST /login/email` | Request an email code with `{ "email": "..." }`; return 202. |
| `POST /signup/email/callback` and `POST /login/email/callback` | Exchange `{ "email": "...", "code": "123456" }` for tokens. |
| `GET /signup/onboarding` | Read the current user data. |
| `POST /signup/onboarding` | Complete onboarding and return `{ user, accessToken, tokenType, expiresIn }`. |
| `GET /profile` | Read the user snapshot in the access token. |
| `GET /ping` | Check that the bearer token is recognized. |
| `POST /refresh` | Rotate the refresh token and return a new access token. |
| `POST /logout` | Revoke the current session. |

Google redirects the browser to `/google/signup/callback` or `/google/login/callback` on the frontend. The frontend POSTs the returned code and state to the matching API callback. The API verifies the OAuth state cookie and exchanges the code with Google. The Google client secret and PKCE verifier stay on the backend.

Successful token exchanges return `{ accessToken, tokenType: "Bearer", expiresIn }` as JSON and set a `refresh_token` HTTP-only, Secure cookie scoped to `/auth/refresh`. Send the access token as `Authorization: Bearer <accessToken>` on protected requests. Access tokens expire after 15 minutes; refresh tokens expire after seven days. The guard verifies access tokens without a database lookup. Logging out deletes the database session and prevents refresh, while an already issued access token remains valid until it expires.

New users must complete onboarding before using other protected routes. The database stores permissions as a bitmask: `isAdmin = 1`, `isTeacher = 2`, and `isStudentCouncil = 4`. Signup and onboarding do not set permissions; set the admin bit only by directly editing the database. Permission changes take effect in newly issued access tokens.

After onboarding, use the `accessToken` in the response for subsequent requests. The original access token still contains the pending user snapshot.

The API does not enable CORS. Browser clients should reach it through the same origin, such as a reverse proxy. The refresh cookie is Secure and requires HTTPS outside localhost.

## Checks

Run `npm --workspace @dimigo-council/backend run build`, `lint`, `test`, and `test:e2e` from the repository root.
