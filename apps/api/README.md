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

## MCP server

`src/mcp/` exposes Habits+ to AI assistants over the [Model Context Protocol](https://modelcontextprotocol.io): tools `list_habits`, `get_habit_history`, `list_goals`, `log_habit`, `unlog_habit`, `create_habit`, the resource `habits://today` and the prompt `weekly_review`. Design: [ADR 0003](../../docs/adr/0003-mcp-server.md), roadmap: [MCP plan](../../docs/MCP_PLAN.md).

Both transports need a personal token (expires after `JWT_EXPIRES_IN`, and after a password change):

```bash
npm run mcp:token -w @habit-tracker/api      # prompts for email and password, prints the token
```

### Over HTTP (the running API)

`POST /api/mcp` speaks Streamable HTTP in stateless mode, with a Bearer token only (the session cookie is refused). Start the API with `npm run dev:api`, then:

```bash
claude mcp add --transport http habits-plus http://localhost:4000/api/mcp \
  --header "Authorization: Bearer <token>"
```

MCP Inspector: `npx @modelcontextprotocol/inspector`, choose Streamable HTTP, URL `http://localhost:4000/api/mcp`, and add the `Authorization` header. Requests are limited by `MCP_RATE_LIMIT_PER_MINUTE` per user.

### Over stdio (no API process)

The server runs as a child process of the client and reads `.env` like the API, so the database must be reachable. Use absolute paths: clients start it from another directory.

```json
{
  "mcpServers": {
    "habits-plus": {
      "command": "/path/to/dashboard-app/node_modules/.bin/tsx",
      "args": [
        "--tsconfig",
        "/path/to/dashboard-app/apps/api/tsconfig.json",
        "/path/to/dashboard-app/apps/api/src/mcp/stdio.ts"
      ],
      "env": { "HABITS_PLUS_TOKEN": "<token>" }
    }
  }
}
```

- Claude Desktop: Settings → Developer → Edit Config (`claude_desktop_config.json`).
- Claude Code: `claude mcp add habits-plus -e HABITS_PLUS_TOKEN=<token> -- <command> <args...>`.
- MCP Inspector: `npx @modelcontextprotocol/inspector <command> <args...>` with `HABITS_PLUS_TOKEN` set.

stdout is the protocol in this mode; logs go to stderr.

Claude.ai custom connectors need a public HTTPS URL and OAuth, which come in Stage 3.
