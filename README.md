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

After `npm run db:seed`, sign in as `demo@habits.plus` with password `password`.

Shared typed client: `@repo/api-client` (`packages/api-client`).

## Tests

```bash
npm test          # Jest: web, API unit, API integration, shared packages
npm run test:e2e  # Playwright: register, log a habit, first-visit language
```

API integration tests use the `habit_tracker_test` database. End-to-end tests use `habit_tracker_e2e`. Both are created from `DATABASE_URL` unless `TEST_DATABASE_URL` or `E2E_DATABASE_URL` is set.

## CI

`.github/workflows/ci.yml` runs on pushes to `main` and on pull requests. Four jobs run in parallel: lint, typecheck, Jest, and Playwright.

## Docs

- Web app: `apps/web/README.md`
- API: `apps/api/README.md`
- API contract: `apps/api/openapi.yaml`
- Mobile app: `apps/mobile/README.md` (not started)
