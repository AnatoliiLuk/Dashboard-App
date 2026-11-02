# ADR 0002: Sessions After a Credential Change

**Status:** Accepted
**Date:** 2026-11-02
**Spec:** [Account page](../specs/account-page.md)

## Context

Sessions are stateless JWTs (`{ id, email }`, `JWT_EXPIRES_IN` = 7 days) in an
httpOnly cookie or a Bearer header. `authMiddleware` checks only the signature.
So today:

- Changing the password would leave every other device signed in for up to
  7 days. If the password was changed because it leaked, the attacker keeps
  access.
- A deleted user's token still passes `authMiddleware`. `GET /auth/me` returns
  401, but other endpoints run and fail on foreign keys with a 500.
- The token's `email` goes stale after an email change.

## Options

### A. Keep stateless JWTs, change nothing

- No extra database work per request.
- Password change does not protect against a leaked password for up to 7 days.
- Deleted users still need a separate fix.

### B. `tokenVersion` on `User`, checked on every request

Add `tokenVersion Int @default(0)`. Put it in the JWT as `ver`. `authMiddleware`
loads `{ id, tokenVersion }` by primary key and rejects with 401 if the user is
missing or `ver` does not match. A password change increments the version and
issues a new token for the current device.

- Signs out other devices at once; fixes deleted users in the same check.
- `req.user` can be filled from the database, so a stale `email` in the token
  no longer matters (drop `email` from the payload).
- One primary-key lookup per authenticated request.
- Existing tokens have no `ver`. Treat missing as `0` so nobody is signed out
  by the deploy.

### C. Server-side sessions table

Store each session (id, user, created, last seen, device). The cookie holds a
random session id.

- Enables "sign out this device" and a list of sessions later.
- Largest change: login, logout, middleware, tests, and Bearer clients all
  change; needs cleanup of expired rows.
- More than this feature needs.

## Decision

**B. `tokenVersion`.**

| Event            | Other sessions | This session                  |
| ---------------- | -------------- | ----------------------------- |
| Password change  | Signed out     | New token (cookie + body)     |
| Email change     | Kept           | Kept (email read from the DB) |
| Name change      | Kept           | Kept                          |
| Account deletion | Signed out     | Cookie cleared                |

Email change does not bump the version: the password, not the email, proves
who you are, and the change already requires the current password. Revisit if
email-based password reset is added, because then the email becomes a
credential.

## Consequences

- Needs a migration (`tokenVersion`), reviewed by hand.
- `authMiddleware` becomes async and touches the database; its tests need a
  user row or a stubbed lookup.
- `TokenPayload` becomes `{ id, ver }`; anything that read `req.user.email`
  reads it from the database instead (nothing does today).
- Logout still only clears the cookie. A copied token stays valid until it
  expires or the password changes.
