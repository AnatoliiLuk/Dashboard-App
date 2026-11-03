# MCP Server - Practice Plan

Goal: expose Habits+ as a Model Context Protocol (MCP) server, so AI assistants
(Claude Desktop, Claude Code, Cursor, Claude.ai) can read and log a person's
habits. Each stage ships on its own and ends with a short note on what was learned.

**Out of scope:** mobile.

**SDK:** `@modelcontextprotocol/sdk` 1.x (stable, CommonJS, works with zod 3).
The v2 split packages (`@modelcontextprotocol/server`) need zod 4; revisit when
the API moves to zod 4.

---

## Design

One server definition, several transports. The MCP layer is thin: tools call the
existing services, so ownership checks, validation and streak maths stay in one place.

```
apps/api/src/mcp/
  server.ts       createMcpServer(userId, services) -> McpServer (tools, resources, prompts)
  tools.ts        tool handlers (one per tool, plain functions, unit-tested)
  stdio.ts        Stage 1 entry: personal token -> userId -> StdioServerTransport
apps/api/src/routes/mcp.routes.ts + controllers/mcp.controller.ts
                  Stage 2 entry: POST /api/mcp, Bearer -> authMiddleware -> one server per request
```

| Primitive | Name                | What it does                                                        |
| --------- | ------------------- | ------------------------------------------------------------------- |
| Tool      | `list_habits`       | Active habits with streaks and the last 7 days (read-only)          |
| Tool      | `get_habit_history` | Completion dates of one habit over the last N days                  |
| Tool      | `list_goals`        | Active goals with progress (read-only)                              |
| Tool      | `log_habit`         | Mark a habit done for a date (idempotent)                           |
| Tool      | `unlog_habit`       | Undo a completion for a date (idempotent)                           |
| Tool      | `create_habit`      | Create a new habit                                                  |
| Resource  | `habits://today`    | Today's checklist: each active habit and whether it is done         |
| Prompt    | `weekly_review`     | Asks the assistant to review the last 7 days and suggest one change |

Rules:

- `userId` always comes from the authenticated token, never from tool input.
- Tool input is validated with Zod; another user's habit is "not found".
- Tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`) let clients
  decide what needs confirmation. Nothing deletes habits through MCP.
- Expected failures (`AppError` < 500) become `isError` tool results the model can
  recover from; unexpected ones are logged to stderr and hidden.
- stdio servers must never write to stdout except protocol messages.

---

## Stage 1: Local server over stdio

- [x] ADR `docs/adr/0003-mcp-server.md`: MCP vs plain REST tools, stdio vs HTTP, reuse of services
- [x] Add `@modelcontextprotocol/sdk` to `@habit-tracker/api` (one zod copy shared with the SDK, see ADR)
- [x] `createMcpServer` with the tools, resource and prompt above
- [x] `npm run mcp:token` prints a personal token (email + password prompt)
- [x] `npm run mcp` / `stdio.ts`: reads `HABITS_PLUS_TOKEN`, checks it like `authMiddleware` (signature, `tokenVersion`)
- [x] Unit tests through an in-memory MCP client (list tools, call each tool, error paths, ownership)
- [x] End-to-end smoke test: SDK client over real stdio against the test database
- [x] README section with client config
- [ ] Try it with MCP Inspector and Claude Desktop / Claude Code
- [ ] Demo: "I went for a run, log it" -> habit logged and visible in the web app

**Status:** [ ]

## Stage 2: Remote server over Streamable HTTP

- [x] `POST /api/mcp` using `StreamableHTTPServerTransport`, stateless with JSON responses; `GET`/`DELETE` answer 405
- [x] Bearer auth through the existing `authMiddleware`; one server instance per request user
- [x] Session cookie refused on `/api/mcp` (no CSRF path); `WWW-Authenticate: Bearer` on 401
- [x] Per-user rate limit (`MCP_RATE_LIMIT_PER_MINUTE`) and the existing origin check (DNS rebinding protection)
- [x] Integration tests with the SDK client over HTTP (`registerUser()` + `resetDatabase()`)
- [x] `openapi.yaml` and README update
- [ ] Try it from Claude Code (`claude mcp add --transport http`) and MCP Inspector

Known limit: "today" is the server's date. Over stdio that is the person's own
machine; over HTTP a person far from the server's time zone should pass `date`
explicitly. Fix with a stored user time zone if it matters.

**Status:** [ ]

## Stage 3: OAuth 2.1 (MCP authorization spec)

- [x] ADR `docs/adr/0004-mcp-oauth.md`: authorization server in the API (SDK `mcpAuthRouter` + Prisma) vs an external provider
- [x] Protected resource metadata (`/.well-known/oauth-protected-resource/api/mcp`) and `WWW-Authenticate: Bearer resource_metadata=...` on 401
- [x] Authorization server: dynamic client registration, authorization code + PKCE, 1 h access / 30 d rotating refresh tokens (hashed, prefixed), revoke, RFC 8707 audience
- [x] Consent screen in the web app (`/oauth/consent`), en + uk; sign-in keeps the pending request
- [x] Scopes `habits:read`, `habits:write`: tools outside the grant are not registered
- [x] Password change ends OAuth grants (`tokenVersion`, ADR 0002)
- [x] Integration tests for the whole flow (discovery, register, authorize, consent, token, refresh, revoke)
- [ ] Sign in from Claude Code (`claude mcp add --transport http` without a header)
- [ ] Security review (`/security-review`) before merge
- [ ] "Connected apps" on the account page: list grants and revoke them (next PR)
- [ ] Purge script for expired codes and tokens
- [ ] Add as a custom connector in Claude.ai (needs public HTTPS: tunnel or deployment)

**Status:** [ ]

## Stage 4 (optional): AI coach as an MCP client

- [ ] Coach connects to a Google Calendar MCP server (per-user Google OAuth, tokens encrypted at rest)
- [ ] Coach suggests time slots for habits; event creation needs user confirmation
- [ ] Evals updated for the new tools

**Status:** [ ]

---

## CV bullets (fill in when each stage is done)

- Built a Model Context Protocol (MCP) server for a habit-tracking platform
  (TypeScript, Express, Prisma) that lets AI assistants read and update user data
  through typed tools, resources and prompts. _(Stage 1-2)_
- Implemented the MCP OAuth 2.1 authorization flow (PKCE, protected resource
  metadata, consent screen, scoped tokens) for multi-user remote access. _(Stage 3)_
- Reused the existing service layer and guardrails (ownership checks, rate limits),
  covered by unit and integration tests through an MCP client. _(Stage 1-2)_
