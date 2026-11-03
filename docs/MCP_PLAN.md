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
  (Stage 2)       routes/mcp.routes.ts: Streamable HTTP at /mcp behind authMiddleware
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

- [ ] `POST/GET/DELETE /mcp` route using `StreamableHTTPServerTransport` (stateless mode first)
- [ ] Bearer auth through the existing `authMiddleware`; one server instance per request user
- [ ] Rate limit and origin checks (DNS rebinding protection) on `/mcp`
- [ ] Integration tests with the SDK client over HTTP (`registerUser()` + `resetDatabase()`)
- [ ] `openapi.yaml` note and README update

**Status:** [ ]

## Stage 3: OAuth 2.1 (MCP authorization spec)

- [ ] ADR: build an authorization server in the API vs use an external provider
- [ ] Protected resource metadata (`/.well-known/oauth-protected-resource`) and `WWW-Authenticate` on 401
- [ ] Authorization server: authorization code + PKCE, client registration, short-lived access tokens, refresh tokens
- [ ] Consent screen in the web app ("Claude wants to access your habits"), en + uk
- [ ] Scopes: `habits:read`, `habits:write`; revoke access from the account page
- [ ] Security review (`/security-review`) before merge
- [ ] Add as a custom connector in Claude.ai

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
