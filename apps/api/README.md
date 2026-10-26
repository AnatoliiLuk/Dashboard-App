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

## AI coach evals

`evals/` measures the coach on 41 cases in `evals/dataset/coach.cases.jsonl`, with fixed fixture users instead of the database. Code checks each reply (numbers, tools, language, length, prompt leaks), and an LLM judge scores the subjective cases.

```bash
npm run eval -w @habit-tracker/api                  # live, needs ANTHROPIC_API_KEY, about $0.40 per run of 41 cases
npm run eval -w @habit-tracker/api -- --repeat 2    # each case twice, for a steadier pass rate
npm run eval -w @habit-tracker/api -- --offline     # no key: tests the harness only
```

A live run saves `evals/reports/latest.json` (gitignored) and compares it with the committed `evals/baseline.json`. It exits with code 1 if the pass rate is below 80% or more than 5 points under the baseline. After a prompt change that should become the new reference, run it with `--save-baseline`. `npm test` runs the offline part, so CI needs no key.

## Auth

`POST /api/auth/register` and `POST /api/auth/login` return `{ user }` and set an httpOnly `habits_plus_token` cookie. `POST /api/auth/logout` clears it. Protected routes accept that cookie or `Authorization: Bearer <token>`.
