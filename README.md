# Collabrix

A collaborative project management platform: authentication, workspaces with roles, boards/columns/tasks, drag-and-drop Kanban, comments, checklists, file attachments, notifications, real-time sync, search, calendar view, and analytics.

**Stack:** NestJS + Prisma + PostgreSQL (backend) · React + TypeScript + Vite + Tailwind CSS v4 (frontend) · Socket.io (real-time) · @dnd-kit (drag-and-drop) · Docker + Jenkins + Docker Hub + Render (CI/CD & deployment).

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

The fastest way to run everything (Postgres + backend + frontend) with no local Node install required:

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

The production frontend Docker image doesn't use `VITE_API_URL` at runtime — it's built to call a relative `/api`, which nginx proxies to whatever `BACKEND_ORIGIN` is set to at container start (see `frontend/nginx.conf.template`). This is what lets the same image work unmodified in Docker Compose (`BACKEND_ORIGIN=http://backend:3000`) and on Render (`BACKEND_ORIGIN=https://<backend-service>.onrender.com`).

## Docker

- `backend/Dockerfile` — multi-stage build; production stage runs `prisma migrate deploy && node dist/main`.
- `frontend/Dockerfile` — multi-stage build; production stage is nginx serving the built SPA and proxying `/api` + `/socket.io` to `$BACKEND_ORIGIN`.
- `docker-compose.yml` — wires up all three services with a named volume for Postgres data.

```bash
docker compose up -d --build     # build and start everything
docker compose logs -f backend   # tail logs
docker compose down              # stop (add -v to also wipe the Postgres volume)
```

## CI/CD

```
GitHub push → Jenkins → install deps → lint → test (backend, real Postgres)
            → build frontend → build Docker images → push to Docker Hub → deploy to Render
```

The `Jenkinsfile` at the repo root runs on every push (via a GitHub webhook or polling, depending on how the Jenkins job is configured):

1. **Install dependencies** — `npm ci`
2. **Lint** — backend (eslint) and frontend (oxlint) in parallel
3. **Test backend** — spins up a throwaway Postgres container, applies migrations, runs `build`, unit tests, and e2e tests
4. **Build frontend** — `vite build`
5. **Build Docker images** — both `backend/Dockerfile` and `frontend/Dockerfile`, tagged with the short commit SHA and `latest`
6. **Push to Docker Hub** *(`main` branch only)*
7. **Deploy to Render** *(`main` branch only)* — hits each service's Render deploy hook, which pulls the new `latest` image and redeploys

Steps 6–7 need Docker Hub + Render set up and the matching Jenkins credentials configured — see below. Until those exist, the pipeline still runs and validates steps 1–5; only the push/deploy stages fail.

### Jenkins prerequisites

The Jenkins agent running this pipeline needs **Docker** and **Node.js 22** available on `PATH` (the backend test stage runs a Postgres container directly via the Docker CLI, and several stages call `npm`). A single "Docker host" agent with both installed is the simplest setup — this pipeline doesn't use Docker-in-Docker or a containerized agent.

Set `DOCKERHUB_NAMESPACE` at the top of the `Jenkinsfile` to your own Docker Hub username/org before your first run.

### One-time Docker Hub + Render setup

1. **Docker Hub** — create two repositories: `<namespace>/collabrix-backend` and `<namespace>/collabrix-frontend` (or let the first push create them automatically, if your account allows it).

2. **Render Postgres** — create a managed Postgres instance (Render dashboard → New → PostgreSQL). Note its **Internal Database URL**.

3. **Render backend service** — New → Web Service → Deploy an existing image → `<namespace>/collabrix-backend:latest`. Set environment variables:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | the Render Postgres internal URL from step 2 |
   | `JWT_SECRET` | a long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `PORT` | `3000` |
   | `CORS_ORIGIN` | the frontend service's URL (from step 4, added after it exists) |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | optional |
   | `CLOUDINARY_URL` | optional |
   | `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | optional |

   Note the service's Render URL (e.g. `https://collabrix-backend.onrender.com`) and copy its **Deploy Hook** URL (Settings → Deploy Hook).

4. **Render frontend service** — New → Web Service → Deploy an existing image → `<namespace>/collabrix-frontend:latest`. Set:

   | Variable | Value |
   |---|---|
   | `BACKEND_ORIGIN` | the backend service's URL from step 3 |

   Copy its Deploy Hook URL too, and go back and set the backend's `CORS_ORIGIN` to this service's URL.

### Required Jenkins credentials

Manage Jenkins → Credentials:

| Credential ID | Type | Value |
|---|---|---|
| `dockerhub-credentials` | Username/password | Docker Hub username + access token |
| `render-backend-deploy-hook` | Secret text | backend service's deploy hook URL (step 3) |
| `render-frontend-deploy-hook` | Secret text | frontend service's deploy hook URL (step 4) |

Once these exist, every push to `main` builds, tests, pushes images, and deploys automatically.

## Project structure

```
backend/    NestJS API — Prisma + PostgreSQL, JWT auth, RBAC, Socket.io gateway
frontend/   React + Vite + Tailwind SPA — React Query, @dnd-kit, React Router
Jenkinsfile CI/CD pipeline (Docker Hub + Render)
docker-compose.yml  Local full-stack orchestration
```
