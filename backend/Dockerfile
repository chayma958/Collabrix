# Build context is the repo root (npm workspaces monorepo) — see docker-compose.yml.

FROM node:22-bookworm-slim AS build
WORKDIR /app

# Native deps (bcrypt) sometimes need a source rebuild if no prebuilt binary
# matches the exact Node/OS combo — keep build tools available just in case.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

COPY backend backend
# prisma.config.ts requires DATABASE_URL to resolve even for `generate`,
# which never actually connects to a database — a build-time placeholder is fine.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npm run prisma:generate --workspace backend
RUN npm run build --workspace backend

FROM node:22-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production

# Prisma's query engine needs to detect the linked libssl version to pick the
# right binary target; bookworm-slim doesn't ship the openssl package by
# default, which leaves it guessing (and defaulting to the wrong one).
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY backend/package.json ./backend/package.json
COPY backend/prisma.config.ts ./backend/prisma.config.ts
COPY backend/tsconfig.json ./backend/tsconfig.json

WORKDIR /app/backend
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
