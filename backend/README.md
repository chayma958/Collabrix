# Collabrix backend

NestJS + Prisma + PostgreSQL API. See the [root README](../README.md) for full setup and run instructions.

## Modules

- `auth` — register/login, JWT issuance, `JwtAuthGuard` (global, bypassed via `@Public()`)
- `common` — `@Roles`/`@ResolveWorkspaceFrom` decorators and `WorkspaceRolesGuard` (shared RBAC gate)
- `users`, `workspaces`, `boards`, `columns`, `tasks`, `labels` — feature modules

## Scripts

- `npm run start:dev` — run with watch mode
- `npm run prisma:migrate` — run Prisma migrations
- `npm run prisma:studio` — open Prisma Studio
- `npm run lint` / `npm run test`
