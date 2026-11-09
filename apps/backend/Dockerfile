# Build from the repository root: docker build -f apps/backend/Dockerfile .
FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --workspace @dimigo-council/backend --include-workspace-root=false

COPY apps/backend apps/backend
RUN npm --workspace @dimigo-council/backend run build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --omit=dev --workspace @dimigo-council/backend --include-workspace-root=false \
    && npm cache clean --force

COPY --from=build /app/apps/backend/dist apps/backend/dist
USER node
EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]
