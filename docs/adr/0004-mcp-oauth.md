# ADR 0004: OAuth 2.1 for the MCP Endpoint

**Status:** Accepted
**Date:** 2026-11-03
**Plan:** [MCP practice plan](../MCP_PLAN.md), Stage 3

## Context

`/api/mcp` (ADR 0003) accepts a personal JWT that a person copies from
`npm run mcp:token` into a client config. That works for one developer, but:

- Claude.ai custom connectors, and other remote MCP clients, follow the MCP
  authorization spec: OAuth 2.1 with PKCE, protected resource metadata
  (RFC 9728), authorization server metadata (RFC 8414) and dynamic client
  registration (RFC 7591). They cannot use a pasted token.
- A personal JWT is the full session: every scope, 7 days, revocable only by
  changing the password.

## Options

### A. Authorization server inside the API

The SDK's `mcpAuthRouter` serves the metadata, `/authorize`, `/token`,
`/register` and `/revoke` endpoints and checks PKCE. We implement its
`OAuthServerProvider` on Prisma and add a consent screen to the web app.

- People sign in with their existing Habits+ account; no second identity.
- No third-party account or cost; works offline for local development.
- We own token storage and its security: hashing, expiry, rotation, revocation.

### B. External identity provider (Auth0, WorkOS, Keycloak)

The provider issues tokens; the API only verifies them (JWKS).

- Less security-sensitive code of our own.
- Habits+ accounts would need linking to provider identities, and local
  development needs a provider tenant or a Keycloak container.
- Most of the learning (PKCE, grants, consent) happens inside the provider.

## Decision

Option A.

- **Endpoints** at the API root through `mcpAuthRouter`, mounted before CORS
  and the origin check (they are called by non-browser and browser clients
  and use no cookies). Protected resource metadata at
  `/.well-known/oauth-protected-resource/api/mcp`.
- **Consent:** `/authorize` redirects to the web page `/oauth/consent` with a
  signed, 10-minute request (JWT, own audience) holding client, redirect URI,
  PKCE challenge, scopes, state and resource. The signed-in person approves or
  denies through `/api/oauth/consent` (session cookie + origin check), which
  returns the client redirect with `code` or `error=access_denied`.
- **Scopes:** `habits:read` (list and history tools, resource, prompt) and
  `habits:write` (log, undo, create). Tools outside the granted scopes are not
  registered, so the model never sees them. No scope requested means both.
- **Tokens** are opaque random strings with a prefix (`hpat_` access,
  `hprt_` refresh) so they are easy to recognise in logs and secret scanners.
  Only SHA-256 hashes are stored. Access tokens live 1 hour, refresh tokens
  30 days and rotate on every use. Authorization codes live 10 minutes and
  are single use.
- **Audience:** every code and token is bound to the MCP resource URL
  (RFC 8707); a token for another resource is rejected.
- **Sessions:** tokens store the user's `tokenVersion`; a password change or
  account deletion ends every OAuth grant too (ADR 0002).
- **Personal JWTs** stay accepted on `/api/mcp` with full scopes, for stdio
  and local `claude mcp add --header` setups.
- **Clients** register dynamically. A confidential client's secret is stored
  as issued, because the SDK compares it directly; PKCE is required for every
  client either way.

## Consequences

- New tables: `oauth_clients`, `oauth_authorization_codes`, `oauth_tokens`.
- New settings: `API_PUBLIC_URL` (issuer and resource URLs) and `WEB_URL`
  (consent page). Claude.ai needs `API_PUBLIC_URL` to be public HTTPS.
- Expired codes and tokens stay in the table until cleaned up; a purge script
  can follow, like `coach:purge`.
- A "Connected apps" list with revoke on the account page is the next step.
