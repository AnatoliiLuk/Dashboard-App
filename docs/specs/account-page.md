# Spec: Account Page

**Status:** Draft, needs review
**Scope:** API + web. Mobile is out of scope.
**Decisions:** [ADR 0001](../adr/0001-account-deletion.md), [ADR 0002](../adr/0002-session-on-credential-change.md)

## Problem

A signed-in person cannot change anything about their account. The name and
email they registered with are fixed, a forgotten or leaked password can only be
changed in the database, and there is no way to leave the product and take
their data with them. The AI coach spends a daily token budget, but the person
only finds out when a request is refused.

## Today

- `User` has `email` (unique, case-sensitive in Postgres), `name`,
  `passwordHash`. Every other user table cascades on delete.
- Auth is a stateless JWT (`{ id, email }`, 7 days), sent as the
  `habits_plus_token` httpOnly cookie or `Authorization: Bearer`.
  `authMiddleware` only verifies the signature. It never reads the database.
- `GET /auth/me` returns 401 for a deleted user. Other endpoints do not check.
- Register and login do not trim or lowercase the email.
- The api-client calls `onUnauthorized` on any 401, and the web app signs out.
- `DELETE /coach/conversation` already exists (New chat). Coach usage is in
  `ai_usage`, counted per UTC day against `AI_DAILY_TOKEN_BUDGET`. No endpoint
  exposes it.

## User stories

1. As a signed-in person, I can see my name, email and the date I joined.
2. I can change my name.
3. I can change my email, confirming with my current password.
4. I can change my password, confirming with my current password. My other
   devices are signed out; this one stays signed in.
5. I can see how much of today's AI coach budget I have used and when it resets.
6. I can clear my AI coach conversation from the account page.
7. I can delete my account, confirming with my password. All my data goes, and
   I am signed out everywhere.

## Acceptance criteria

### Page

- `/account` is behind `AuthGuard` and linked from the `AppShell` menu.
- Four sections in this order: Profile, Security, AI Coach, Danger zone.
- Every string is in `en.ts` and `uk.ts`.
- A section's form shows field errors inline and keeps the other sections
  usable while it saves.

### Profile

- Shows name, email and join date (`createdAt`, formatted in the UI locale).
- Name: trimmed, 1-100 characters.
- Email: trimmed, lowercased, valid format, at most 254 characters.
- Changing the email requires `currentPassword`. Changing only the name does not.
- Email already used by another account (any case): **409**
  `Email already in use`, shown on the email field.
- Submitting the same values is a no-op that returns 200.
- On success the `auth.me` query is updated without a reload.

### Security

- Fields: current password, new password, confirm new password (confirm is
  checked in the web form only).
- New password: 8-128 characters, must differ from the current one (**400**).
- Wrong current password: **400** `Current password is incorrect`, on the
  current password field. Never 401: the client signs out on any 401.
- On success: other sessions stop working (ADR 0002). The response sets a new
  session cookie and returns a new token, so this device stays signed in.
- Rate limited per user (5 per minute) because it verifies a password.

### AI Coach

- Shows tokens used today, the daily limit, a progress bar, and the reset time
  (next midnight UTC, shown in local time).
- Counts tokens the same way as `DailyTokenBudget` (`billableTokens`: cache
  reads left out).
- When the coach is disabled (`AI_ENABLED=false`) the section says so and hides
  the usage bar. Clear conversation still works.
- "Clear conversation" asks for confirmation, then calls the existing
  `DELETE /coach/conversation`. The coach chat query is invalidated.
- Not rate limited (same rule as reading the conversation).

### Danger zone

- "Delete account" opens a dialog that explains what is deleted and asks for
  the password.
- Wrong password: **400**, account kept.
- On success: the user row and everything that cascades from it are deleted
  in one transaction (ADR 0001), the response clears the session cookie
  (**204**), and the web app signs out and goes to `/login`.
- Any request with a token for the deleted user returns **401** (ADR 0002).
- Rate limited per user (5 per minute).

## API

| Method   | Path                      | Body                                  | Success                  |
| -------- | ------------------------- | ------------------------------------- | ------------------------ |
| `PATCH`  | `/api/users/me`           | `{ name?, email?, currentPassword? }` | 200 `UserProfile`        |
| `POST`   | `/api/users/me/password`  | `{ currentPassword, newPassword }`    | 200 `{ token }` + cookie |
| `DELETE` | `/api/users/me`           | `{ password }`                        | 204, cookie cleared      |
| `GET`    | `/api/coach/usage`        | -                                     | 200 `CoachUsage`         |
| `DELETE` | `/api/coach/conversation` | -                                     | 204 (exists)             |

`UserProfile`: `{ id, email, name, createdAt }` (same shape as `GET /auth/me`).
`CoachUsage`: `{ enabled, usedTokens, dailyLimit, resetsAt }`.

A body with neither `name` nor `email` on `PATCH /users/me` is a 400.
`DELETE` with a JSON body is allowed by Express and the api-client; it keeps the
password out of the URL and logs.

## Edge cases

| Case                                                     | Expected                                                                                     |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| New email differs from an existing one only in case      | 409. Emails are stored lowercased, so the unique index catches it.                           |
| New email equals own email in another case               | Stored lowercased; no conflict with self.                                                    |
| Existing rows with mixed-case emails                     | One-time data migration lowercases them. It must first report case-only duplicates and stop. |
| Login with `User@X.com` after register with `user@x.com` | Works: login lowercases before lookup.                                                       |
| Two accounts change to the same email at the same moment | The unique index rejects the second; Prisma `P2002` maps to 409, not 500.                    |
| Wrong current password                                   | 400, never 401.                                                                              |
| Repeated wrong passwords                                 | 429 after 5 per minute per user.                                                             |
| New password equals the current one                      | 400.                                                                                         |
| Token for a deleted user hits any endpoint               | 401 (today: `/auth/me` 401, writes fail with a foreign key error and 500).                   |
| Password changed while another tab is open               | Other tab's next request is 401 and it signs out. This tab keeps working with the new token. |
| Bearer-token client (e.g. tests, future mobile)          | Gets the new token in the response body after a password change.                             |
| Account deleted while a coach request is in flight       | The usage row insert fails on the foreign key; logged, the reply is not delivered.           |
| Delete account with `AI_ENABLED=false`                   | Same as normal; no AI code runs.                                                             |
| Name of only spaces                                      | 400 after trim.                                                                              |

## Out of scope

- Email verification or confirmation links (there is no mail sender).
- Password reset by email ("forgot password").
- Data export.
- Avatar, timezone, or locale preferences stored on the account (locale stays a cookie).
- A list of active sessions or "sign out of this device only".
- Admin tools for managing other users.
- Mobile.

## Resolved questions

- Changing the email does not sign out other sessions (ADR 0002).
- No AI cost history is kept after a user is deleted (ADR 0001).
