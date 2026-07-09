# Collabrix

A collaborative project management platform: authentication, workspaces with roles, boards/columns/tasks, drag-and-drop Kanban, comments, checklists, file attachments, notifications, real-time sync, search, calendar view, and analytics.

**Stack:** NestJS + Prisma + PostgreSQL (backend) · React + TypeScript + Vite + Tailwind CSS v4 (frontend) · Socket.io (real-time) · @dnd-kit (drag-and-drop) · Docker + GitHub Actions (CI).

## Features

- **Auth** — email/password with email verification and forgot-password, plus Google OAuth
- **Workspaces** — role-based access control (Owner/Admin/Member/Viewer), invites by email
- **Boards** — columns, tasks, drag-and-drop reordering, labels, priorities, due dates, assignees
- **Collaboration** — comments, checklists, file attachments (Cloudinary), activity history
- **Real-time** — live board updates and notifications over Socket.io
- **Notifications** — cursor-paginated, with unread count
- **Search, calendar view, analytics dashboard**

## Architecture

```
┌─────────────┐      /api/*, /socket.io/*      ┌─────────────┐      Prisma      ┌────────────┐
│  frontend    │ ──────────proxy (nginx)──────▶ │   backend    │ ────────────────▶ │  postgres   │
│  React SPA   │ ◀───────────────────────────── │  NestJS API  │ ◀──────────────── │            │
└─────────────┘                                └─────────────┘                   └────────────┘
```

The frontend is a static SPA served by nginx, which also reverse-proxies `/api` and `/socket.io` to the backend — so the browser only ever talks to one origin. The backend is a stateless NestJS API behind Prisma/PostgreSQL. Both are independently containerized (see [Docker](#docker) below) so they can scale and deploy separately.

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- Docker Desktop

## Quick start — Docker (whole app)

```bash
cp backend/.env.example backend/.env
# edit backend/.env — at minimum set a real JWT_SECRET

docker compose up -d --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api
- Postgres: localhost:5432

The backend container runs `prisma migrate deploy` automatically on startup before serving. Google OAuth, Cloudinary, and Resend are optional — the app runs without them, just without those specific features (social login, file uploads, transactional email).

## Local development (hot reload)

For active development, run Postgres in Docker but the app itself natively for fast rebuilds:

```bash
npm install

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up -d postgres
npm run prisma:migrate

npm run dev
```

- Backend: http://localhost:3000/api
- Frontend: http://localhost:5173

## Scripts

Run from the repo root (npm workspaces):

| Script | Description |
|---|---|
| `npm run dev` | Backend + frontend, both with hot reload |
| `npm run dev:backend` / `npm run dev:frontend` | Just one side |
| `npm run build` | Production build, both workspaces |
| `npm run lint` | Lint both workspaces (eslint + oxlint) |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm test --workspace backend` | Backend unit tests (jest) |
| `npm run test:e2e --workspace backend` | Backend e2e tests (jest + supertest, needs a running Postgres) |

## Environment variables

**`backend/.env`** (see `backend/.env.example`):

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `JWT_SECRET` | yes | Signing secret for access tokens |
| `JWT_EXPIRES_IN` | yes | e.g. `7d` |
| `PORT` | yes | API port (default `3000`) |
| `CORS_ORIGIN` | yes | Allowed frontend origin |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | optional | Google OAuth login |
| `CLOUDINARY_URL` | optional | File attachment uploads |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | optional | Verification/reset/invite emails |

**`frontend/.env`** (see `frontend/.env.example`):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL, e.g. `http://localhost:3000/api` |

The production frontend Docker image doesn't use `VITE_API_URL` at runtime — it's built to call a relative `/api`, which nginx proxies to whatever `BACKEND_ORIGIN` is set to at container start (see `frontend/nginx.conf.template`).

## Docker

- `backend/Dockerfile` — multi-stage build; production stage runs `prisma migrate deploy && node dist/src/main`.
- `frontend/Dockerfile` — multi-stage build; production stage is nginx serving the built SPA and proxying `/api` + `/socket.io` to `$BACKEND_ORIGIN`.
- `docker-compose.yml` — wires up all three services with a named volume for Postgres data.

```bash
docker compose up -d --build     # build and start everything
docker compose logs -f backend   # tail logs
docker compose down              # stop (add -v to also wipe the Postgres volume)
```

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main` — lint, build, and test both workspaces (backend against a real Postgres service container, including e2e tests).

## Project structure

```
backend/    NestJS API — Prisma + PostgreSQL, JWT auth, RBAC, Socket.io gateway
frontend/   React + Vite + Tailwind SPA — React Query, @dnd-kit, React Router
.github/workflows/  CI checks (lint/build/test)
docker-compose.yml  Local full-stack orchestration
```
