# ADR 0003: Habits+ as an MCP Server

**Status:** Accepted
**Date:** 2026-11-03
**Plan:** [MCP practice plan](../MCP_PLAN.md)

## Context

People already ask AI assistants (Claude Desktop, Claude Code, Cursor,
Claude.ai) about their day. Letting an assistant read and log habits means
exposing Habits+ to a model through a standard interface. The in-app AI coach
already has read-only tools (`src/ai/tools/`) built on the services layer.

## Options

### A. Document the REST API and let each client wrap it

- No new code.
- Every assistant needs its own glue; models see HTTP details instead of
  task-shaped tools; no shared description of what is safe to call.

### B. MCP server that calls the HTTP API with `@repo/api-client`

- Same shape as third-party MCP servers (GitHub, Jira): a separate process
  that only knows the public API.
- Every tool is an extra network hop, and rules such as "no future dates" would
  live in a second place.

### C. MCP server inside the API that calls the services directly

- Ownership checks, validation, streak and goal maths are reused as is
  (`coach.data.ts` is shared with the coach).
- One server definition (`createMcpServer`) can be served over stdio now and
  over Streamable HTTP later, behind the same `authMiddleware`.
- The stdio process needs database access, so it is a local, single-user setup
  until Stage 2.

## Decision

Option C.

- `createMcpServer({ userId, today }, services)` builds one server per
  authenticated user. `userId` never comes from tool input.
- Tools are task-shaped (`log_habit`, not `POST /completions`) and annotated
  (`readOnlyHint`, `destructiveHint`, `idempotentHint`) so clients can decide
  what to confirm. MCP cannot delete or archive anything.
- Expected failures (`AppError` < 500) become `isError` results the model can
  recover from; anything else is logged to stderr and replaced by a generic
  message.
- Stage 1 transport is stdio with a personal token (`HABITS_PLUS_TOKEN`) checked
  by the same `authenticateToken` as `authMiddleware`. The token is checked once
  at start-up; after a password change the server must be restarted.
- SDK: `@modelcontextprotocol/sdk` 1.x. The v2 packages need zod 4.
- Stage 2 transport is Streamable HTTP at `POST /api/mcp`, stateless (no
  `Mcp-Session-Id`, JSON responses, a new server per request). No tool streams
  progress or needs server-initiated messages, and stateless requests work on
  any API instance without sticky sessions. `GET` and `DELETE` answer 405.
- `/api/mcp` accepts only a Bearer token. The session cookie is refused, so a
  web page cannot drive the endpoint with a signed-in person's cookie, and the
  existing origin check rejects foreign browser origins (DNS rebinding).

## Consequences

- The SDK types and the API must share one zod copy. The root `package.json`
  declares `zod@^3.25.76` so npm hoists a single version, and `src/mcp/server.ts`
  imports `zod/v3` (the path the SDK types use under `moduleResolution: node`).
  Moving the API to zod 4 removes both workarounds.
- The token lasts `JWT_EXPIRES_IN` (7 days). Long-lived, revocable tokens with
  scopes come with OAuth in Stage 3.
- stdout belongs to the protocol in stdio mode; `stdio.ts` sends `console.log`
  to stderr.
