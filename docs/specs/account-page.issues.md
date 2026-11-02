# Account Page: Issue Drafts

Created as GitHub issues #2 to #8 (draft N is issue N+1). Labels: `account`,
plus `api` and/or `web`. 1 and 2 (#2, #3) unblock the rest.

---

## 1. Account: auth hardening (tokenVersion, email normalization)

Labels: `account`, `api`

Foundation for the account page. See ADR 0002 and the spec's edge cases.

- [ ] Migration: `tokenVersion Int @default(0)` on `User`
- [ ] Data migration lowercases existing emails; reports case-only duplicates and stops if any exist
- [ ] Register and login trim + lowercase the email
- [ ] JWT payload `{ id, ver }`; a missing `ver` counts as `0`
- [ ] `authMiddleware` loads the user by id: missing user or version mismatch -> 401
- [ ] Integration test: token of a deleted user -> 401 on `GET /habits`
- [ ] Integration test: register `user@x.com`, log in as `User@X.com`

## 2. Account: shared contract

Labels: `account`, `api`, `web`

- [ ] `packages/types`: `UpdateProfileDto`, `ChangePasswordDto`, `DeleteAccountDto`, `CoachUsage`
- [ ] `packages/api-client`: `users` endpoints (`updateMe`, `changePassword`, `deleteMe`) and `coach.getUsage`
- [ ] `openapi.yaml` for all four endpoints

## 3. Account: profile (name, email)

Labels: `account`, `api`, `web`

- [ ] `PATCH /api/users/me`; email change requires `currentPassword`
- [ ] Duplicate email (any case) -> 409, including the `P2002` race
- [ ] Wrong current password -> 400, never 401
- [ ] Web Profile section, updates the `auth.me` query, en + uk

## 4. Account: change password

Labels: `account`, `api`, `web`

- [ ] `POST /api/users/me/password`, rate limited 5/min per user
- [ ] Wrong current -> 400; same as current -> 400; 8-128 characters
- [ ] Increments `tokenVersion`, returns a new token and sets the cookie
- [ ] Integration test: old token -> 401, new token -> 200
- [ ] Web Security section with confirm field, en + uk

## 5. Account: AI coach usage and clear conversation

Labels: `account`, `api`, `web`

- [ ] `GET /api/coach/usage` -> `{ enabled, usedTokens, dailyLimit, resetsAt }`, same count as `DailyTokenBudget`
- [ ] Web AI Coach section: progress bar, reset time in local time, disabled state
- [ ] Clear conversation with confirmation, uses existing `DELETE /coach/conversation`
- [ ] en + uk

## 6. Account: delete account

Labels: `account`, `api`, `web`

See ADR 0001.

- [ ] `DELETE /api/users/me` with `{ password }`, rate limited 5/min per user
- [ ] Wrong password -> 400, account kept
- [ ] One transaction; 204 and cookie cleared
- [ ] Integration test: user with data in every table is deleted with no orphans
- [ ] Web Danger zone dialog, signs out and goes to `/login`, en + uk

## 7. Account: page shell and navigation

Labels: `account`, `web`

- [ ] `app/account/page.tsx` (thin) + `AccountView` with the four sections
- [ ] Link in the `AppShell` menu
- [ ] en + uk
