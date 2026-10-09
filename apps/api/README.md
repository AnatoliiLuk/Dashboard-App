# Habits+ API

Express API for accounts, habits, and daily completions. Postgres data goes through Prisma. Request bodies are checked with Zod before a controller runs.

From the repo root:

```bash
npm run dev:api
```

The server listens on [http://localhost:4000](http://localhost:4000). Routes under `/api` are listed in `openapi.yaml`.

## Environment

Copy the root `.env.example` to `.env`. The API reads that file. `DATABASE_URL` and `JWT_SECRET` (at least 32 characters) are required. `CORS_ORIGINS` must include the web origin, `http://localhost:3001` in local development.

```bash
npm run db:migrate
npm run db:seed
```

The seed creates `demo@habits.plus` / `password` when that user is missing.

## Tests

`npm test` from the repo root runs this package's Jest suite: unit tests, then integration tests against `habit_tracker_test`. Integration tests need Postgres and `psql` on the path.

## Auth

`POST /api/auth/register` and `POST /api/auth/login` return `{ user, token }`. Send the token as `Authorization: Bearer <token>` on habit and completion routes, and on `GET /api/auth/me`.
