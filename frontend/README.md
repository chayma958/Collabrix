# Collabrix frontend

React + TypeScript + Vite + Tailwind CSS v4 SPA. See the [root README](../README.md) for full setup and run instructions.

## Structure

- `router/` — route tree (`/login`, `/register`, `/workspaces`, `/workspaces/:workspaceId`, `/workspaces/:workspaceId/boards/:boardId`)
- `lib/` — API client (axios, JWT-attaching), React Query client
- `features/{auth,workspaces,boards,tasks,labels}/` — per-feature `api.ts`, `hooks/`, `pages/` or `components/`
- `components/ui/` — design-system primitives (Button, Input, Modal, Badge, Avatar, Select)
- `components/layout/` — `AppShell`, `ProtectedRoute`

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — typecheck + production build
- `npm run lint`
