# Habits+

A daily habit log built with React, Next.js, and TypeScript. Mark what you did today and keep a streak.

This repository is a monorepo. The web app lives in `apps/web`, the API in `apps/api`, and shared code in `packages/`.

## Run

```bash
npm install
npm run dev:web
```

Open [http://localhost:3001](http://localhost:3001).

From the repo root, `npm run dev` starts web + API. Use `npm run dev:web` or `npm run dev:api` for one app only.

## Database

Postgres is required for the API phases. Copy `.env.example` to `.env`, then either:

```bash
# Docker (if installed)
docker compose up -d

# or Homebrew Postgres (what this machine used for Phase 3)
brew services start postgresql@15
```

Then:

```bash
npm run db:migrate
npm run db:seed
```

## API

```bash
npm run dev:api
```

- Health: [http://localhost:4000/health](http://localhost:4000/health)
- Info: [http://localhost:4000/api](http://localhost:4000/api)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Habits: `GET|POST /api/habits`, `GET|PATCH|DELETE /api/habits/:id`
- Completions: `GET|POST /api/completions`, `POST /api/completions/toggle`, `DELETE /api/completions/:id`

Protected routes need `Authorization: Bearer <token>` from login/register.

Shared typed client for web/mobile: `@repo/api-client` (`packages/api-client`).
