# Build from the repository root: docker build -f apps/frontend/Dockerfile .
FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --workspace @dimigo-council/frontend --include-workspace-root=false

COPY apps/frontend apps/frontend
RUN npm --workspace @dimigo-council/frontend run build

FROM nginx:stable-alpine AS runtime
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
