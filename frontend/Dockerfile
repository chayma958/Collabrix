# Build context is the repo root (npm workspaces monorepo) — see docker-compose.yml.

FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

COPY frontend frontend

# Vite inlines env vars at build time. Default to a relative path so the
# built app talks to whatever host it's served from, proxied by nginx below
# — no rebuild needed to point at a different backend host/port.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build --workspace frontend

FROM nginx:1.27-alpine AS production
COPY --from=build /app/frontend/dist /usr/share/nginx/html
# Templated so the same image works against any backend host: Docker Compose's
# service DNS name locally, or a Container App FQDN in Azure. nginx's official
# entrypoint scripts run envsubst on *.template files at container startup.
COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
ENV BACKEND_ORIGIN=http://backend:3000
EXPOSE 80
