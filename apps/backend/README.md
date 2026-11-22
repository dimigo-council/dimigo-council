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

Apply migrations with `npm --workspace @dimigo-council/backend run db:migrate`, then start the API with `npm --workspace @dimigo-council/backend run dev`.

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

## Feature APIs

Every route below needs a bearer access token from a user who finished onboarding, unless it says otherwise. "Council" means the `isStudentCouncil` bit (4); the admin bit alone does not grant council routes. "Admin" means the `isAdmin` bit (1). Permission changes reach a user's access token at the next refresh, so a revoked council member keeps access for up to 15 minutes. Migration `0001_productive_mauler` adds the tables for these features.

List routes take `page` (from 1) and `pageSize` (1 to 100, default 20) and return `{ items, total, page, pageSize }`. Status and scope values use the Korean labels from `documents/기능_명세서.md`, such as `추진 중` or `전체 공개`. Dates without a time (`startAt`, `dueAt`) are `YYYY-MM-DD` in Seoul time.

### Departments and members

| Route | Who | Purpose |
| --- | --- | --- |
| `GET /departments` | Signed in | List departments as `{ id, name }`. |
| `POST /departments`, `PATCH /departments/:id` | Admin | Create or rename a department with `{ name }`. Names are unique. |
| `DELETE /departments/:id` | Admin | Delete a department and its memberships. Activities, tasks, inquiries and surveys keep no department. |
| `GET /members` | Council | List council members with their department, `role` (`member` or `head`), `position`, and the frontend `permission` label (`관리자`, `부서 관리`, `일반`). Filter with `departmentId`. |
| `GET /admin/users` | Admin | List onboarded users, with an optional `search` on name or email. |
| `PUT /members/:userId/council` | Admin | Grant or revoke the council bit with `{ isStudentCouncil }`. Revoking also removes the department membership. |
| `PUT /members/:userId/department` | Admin | Put a council member in a department with `{ departmentId, role, position }`. Each person belongs to one department. |
| `DELETE /members/:userId/department` | Admin | Remove a member from their department. |

### Activities (5.1)

Students see only `전체 공개` activities; `학생회` activities return 404 for them. Linked inquiries, surveys and tasks follow their own visibility rules.

| Route | Who | Purpose |
| --- | --- | --- |
| `GET /activities/landing` | Public | Landing list (LND-03): `전체 공개` activities except `보류`, without 담당자 names. Filter with `status`. |
| `GET /activities` | Signed in | List activities. Filter with `status`, `scope`, `departmentId`, `search`, and `hideOnHold=true` for home lists (HOM-02). |
| `GET /activities/:id` | Signed in | Detail with 활동 계획서 (`plan`), 추진 이력 (`history`), linked inquiries, surveys and tasks, and `canChangeScope`. |
| `POST /activities` | Council | Create with `{ title, description, scope, status, departmentId, ownerId, firstRecord, inquiryIds, plan }`. The 담당자 defaults to the creator. Clears the creator's draft. |
| `PATCH /activities/:id` | Council | Change the title, description, status, department, 담당자 or plan. |
| `PATCH /activities/:id/scope` | 담당자 | Change `{ scope }` (AGD-U1). Any council member may when there is no 담당자. |
| `DELETE /activities/:id` | Council | Delete an activity. Returns 409 while a published survey links to it. |
| `POST /activities/:id/history` | Council | Add an entry `{ kind, title, body, at, link: { label, url } }`. Leave out `at` for a planned entry. |
| `DELETE /activities/:id/history/:historyId` | Council | Delete an entry. |
| `GET`, `PUT`, `DELETE /activities/draft` | Council | Read, save or discard the caller's 임시 저장 (AGD-C2). |

### Tasks (5.2)

All task routes are council only.

| Route | Purpose |
| --- | --- |
| `GET /tasks` | Board list ordered by due date. Filter with `status`, `activityId`, `departmentId`, and `mine=true` for 나의 업무. |
| `GET /tasks/:id` | Detail with 진행 기록 (`logs`). |
| `POST /tasks` | Create with `{ title, tag, activityId, departmentId, assigneeId, startAt, dueAt, status }`. `startAt` defaults to today; the 담당자 defaults to the caller. Records a 배정 entry. |
| `PATCH /tasks/:id` | Edit the title, tag, activity, department, 담당자 or dates. Records a 수정 entry that lists the changes. |
| `POST /tasks/:id/logs` | Add a one-line record `{ text, status }`. A `status` becomes the task's current status. |
| `DELETE /tasks/:id` | Delete a task. |

Each 진행 기록 of a task linked to an activity is also added to that activity's 추진 이력.

### Surveys (5.3)

Students see published surveys from their start time on. Questions are `single`, `multiple`, `short` and `long`.

| Route | Who | Purpose |
| --- | --- | --- |
| `GET /surveys` | Signed in | List with `status` (`진행 중`, `마감`; council also `작성 중`, `예정`). Open surveys come first, closest deadline first. Each item has `responses`, `target`, `participationRate`, `myStatus` and `canRespond`. |
| `GET /surveys/:id` | Signed in | Survey with its questions. |
| `POST /surveys/:id/responses` | Signed in | Respond once with `{ answers, durationSeconds }`. Returns 409 on a second response and 403 when the user's grade or class does not fit. |
| `GET /surveys/drafts/latest` | Council | The caller's latest draft (불러오기). |
| `POST /surveys`, `PATCH /surveys/:id` | Council | Create or autosave a draft: `{ title, intro, activityId, departmentId, grades, collectsClass, opensAt, closesAt, questions }`. Published surveys cannot be edited. |
| `DELETE /surveys/:id` | Council | Delete a draft. |
| `POST /surveys/:id/review-request` | Council | Mark a draft as sent to the 부서장 for review. |
| `POST /surveys/:id/publish` | Council | Publish a draft. Needs a title, a linked activity, a future deadline and complete questions. A future `opensAt` schedules it. |
| `POST /surveys/:id/unpublish` | Council | Return a scheduled survey to draft before it opens. |
| `PATCH /surveys/:id/accepting` | Council | Close early or reopen before the deadline with `{ accepting }`. |
| `GET /surveys/:id/results` | Council | Respondents, `target`, `participationRate`, `daysLeft`, choice counts and ratios, and text answers. Excluded responses are left out. |
| `GET /surveys/:id/responses` | Council | Individual responses in submission order. |
| `PATCH /surveys/:id/responses/:responseId` | Council | Exclude a response from the analysis with `{ excluded }`. |
| `DELETE /surveys/:id/responses/:responseId` | Council | Delete a response. The user still cannot respond again. |

Responses store no user. A separate `survey_participants` table records who responded, without a time or a response id, and only prevents a second response. Grade and class are stored with a response only when the survey collects them.

### Inquiries (5.4)

Students see `전체 공개` inquiries and their own. Anonymous inquiries never show the author's name, grade or class to anyone but the author, council members included. Answers and rejection reasons are shown only to the author and the council.

| Route | Who | Purpose |
| --- | --- | --- |
| `GET /inquiries` | Signed in | List with `status`, `departmentId`, and `mine=true` for 내 질의만 보기. |
| `GET /inquiries/:id` | Signed in | Detail with `statusDates`, `answer`, `rejectReason`, `likes`, `liked` and the linked activity. |
| `POST /inquiries` | Signed in | Submit `{ title, body, scope, anonymous }`. The body is at most 1000 characters; `anonymous` needs `전체 공개`. |
| `PATCH /inquiries/:id/scope` | Author | Change `{ scope, anonymous }`. Moving to `학생회만` turns 익명 off. |
| `POST /inquiries/:id/like` | Signed in | Toggle 공감 on a `전체 공개` inquiry. Returns `{ liked, likes }`. |
| `PATCH /inquiries/:id/department` | Council | Set the 담당 부서 with `{ departmentId }`. |
| `POST /inquiries/:id/answer` | Council | Process with `{ status, body, departmentId }`: `답변 완료` needs an answer, `처리 완료` needs an answer sent now or earlier, and `반려` needs a reason. `처리 완료` and `반려` are final. |
| `PUT /inquiries/:id/activity` | Council | Link an existing activity with `{ activityId }` and add a 질의 entry to its history. |
| `POST /inquiries/:id/activity` | Council | Create an activity from the inquiry. It is `학생회` only unless `scope` is given, and copies the inquiry's title and body only from `전체 공개` inquiries. |
| `DELETE /inquiries/:id/activity` | Council | Unlink the activity. |

### Home (4장)

| Route | Who | Purpose |
| --- | --- | --- |
| `GET /home/student` | Signed in | `openSurveyCount` (open surveys the caller can still answer) and `answeredInquiryCount` (HOM-01). |
| `GET /home/council` | Council | 오늘 확인할 업무, new inquiries in the last 7 days, and the four HOM-06 metrics with their change notes. |

The home lists use the list routes, for example `GET /activities?hideOnHold=true&pageSize=5`, `GET /surveys?status=진행 중&pageSize=3`, `GET /inquiries?mine=true`, and `GET /tasks?mine=true`. 활동 기록 PDFs are static files and have no API.

## Checks

Run `npm --workspace @dimigo-council/backend run build`, `lint`, `test`, and `test:e2e` from the repository root, and check formatting with `npx prettier --check "apps/backend/src/**/*.ts" "apps/backend/test/**/*.ts"`.
