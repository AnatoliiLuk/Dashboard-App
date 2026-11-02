# AI-Assisted Development Lifecycle - Practice Plan

Goal: treat Habits+ as a real product and use AI in every stage of the lifecycle,
not only for writing code. Each phase ends with a short retro so the lessons turn
into a reusable playbook.

**Practice feature:** a dedicated account page (`/account`) on API + web.
**Out of scope:** mobile.

**Time budget:** about one week part-time for Phases 0-4, then Phase 5 ongoing.

---

## Feature Scope: Account Page

Builds on the existing `User` model and `GET /auth/me`.

| Section     | Capability                                              |
| ----------- | ------------------------------------------------------- |
| Profile     | View and edit name and email                            |
| Security    | Change password (current password required)             |
| AI Coach    | Today's usage vs daily budget, clear coach conversation |
| Danger zone | Delete account (password confirm, cascade delete)       |

Likely API surface (to be confirmed in the spec):

- `PATCH /users/me` - name, email
- `POST /users/me/password` - change password
- `DELETE /users/me` - delete account
- `DELETE /coach/conversation` - clear coach history

---

## Phase 0: AI Workspace Setup (Day 1)

Give the agent the same onboarding a new teammate would get.

### 1. Project memory

- [x] Create `CLAUDE.md` (architecture, workspace layout, commands, conventions, definition of done)
- [x] Link existing rules instead of duplicating them (`AGENTS.md` imported, `.cursorrules` commit rules referenced)
- [x] Per-app notes: root `CLAUDE.md` covers API + web; `apps/web/CLAUDE.md` already imports the Next.js rules

### 2. Settings and hooks

- [x] `.claude/settings.json` with allowed commands (lint, typecheck, test, spellcheck, read-only git)
- [x] PostToolUse hook: Prettier on every edited file, ESLint for `apps/web` (errors sent back to Claude)
- [x] Stop hook: typecheck only the workspaces with changed `.ts`/`.tsx` files before Claude finishes
- [x] Permission deny rules (not a hook): `.env`, `apps/*/.env.local`, `prisma/migrations/**`

### 3. Custom skills

- [x] `/new-endpoint` - contract -> tests -> validator -> repository -> service -> controller -> route -> types -> api-client -> web hook -> openapi
- [x] `/ship` - verify -> one-line conventional commit -> push -> PR (user-invoked only)

**Exercise:** ask the agent to explain the auth flow (session cookie, `authMiddleware`)
and the AI coach budget tracking. If the answer is wrong or vague, improve `CLAUDE.md`
until it is right.

- [ ] Exercise done in a fresh session

**Status:** [ ]

---

## Phase 1: Plan - Idea to Spec to Tickets (Day 2)

### 4. Write the spec

- [x] Draft `docs/specs/account-page.md` (problem, user stories, acceptance criteria, out of scope) - drafted directly, not in plan mode
- [x] Ask the agent to list edge cases (duplicate email, email case, wrong current password, deleted user with live session)
- [~] Review it critically - edit at least one decision you disagree with (skipped: both ADRs accepted as drafted)
- [x] Restore or replace `docs/REQUIREMENTS.md` as the product source of truth

### 5. Architecture decisions

- [x] ADR `docs/adr/0001-account-deletion.md` - hard delete with cascade vs soft delete, what happens to AI usage records (Accepted)
- [x] ADR `docs/adr/0002-session-on-credential-change.md` - should a password or email change invalidate other sessions (Accepted)
- [x] Ask the agent for two alternatives and their trade-offs before choosing
- [x] Accept or change both ADRs (set Status to Accepted)

### 6. Tickets

- [x] Issue drafts in `docs/specs/account-page.issues.md`
- [x] Split the spec into GitHub issues (`gh issue create`) with acceptance criteria and labels - #2 to #8
- [x] One issue per section of the account page, each small enough for one PR

**Status:** [x]

---

## Phase 2: Build - Test-First and in Parallel (Day 3-4)

### 7. Shared contract first

- [ ] Update `packages/types` (account DTOs) and `packages/api-client` before splitting work
- [ ] Check Prisma `onDelete` rules for every relation on `User` - add a migration if deletion would fail or leave orphans (reviewed by hand)

### 8. Tests first

- [ ] Generate failing tests from acceptance criteria (API service and integration tests, web component tests)
- [ ] Confirm they fail for the right reason before implementing

### 9. Parallel implementation

- [ ] Run API and web work in separate git worktrees with parallel agents
- [ ] Use the `/new-endpoint` skill for each endpoint - fix the skill when it gets something wrong
- [ ] Web: `apps/web/app/account/page.tsx` with section components and en + uk translations
- [ ] Merge and resolve conflicts yourself - note where the agents diverged

**Status:** [ ]

---

## Phase 3: Review - AI as Second Reviewer (Day 4-5)

### 10. Local review

- [ ] `/code-review` on every branch before opening a PR
- [ ] `/security-review` on password change, email change and account deletion
- [ ] Log each finding as accepted / rejected / false positive

### 11. PR automation

- [ ] Install the Claude GitHub Action (`/install-github-app`)
- [ ] Automatic review on every PR
- [ ] Practice `@claude` comments to fix review feedback

**Status:** [ ]

---

## Phase 4: Test and QA (Day 5)

### 12. End-to-end tests

- [ ] Generate Playwright flows from the spec into `e2e/` (edit profile, change password then log in, clear coach conversation, delete account then fail to log in)
- [ ] Add them to CI

### 13. AI coach evals

- [ ] Add a case where the coach is asked about account settings - it should point to `/account`, not invent features
- [ ] Change the coach prompt on purpose and confirm `eval.yml` catches the regression

**Status:** [ ]

---

## Phase 5: Operate and Maintain (Ongoing)

### 14. Scheduled agents

- [ ] Nightly eval run with a summary
- [ ] Weekly dependency update PR
- [ ] Issue triage (labels, duplicates, reproduction steps)
- [ ] Release notes from conventional commits

### 15. Incident drill

- [ ] Plant a realistic bug (e.g. email change allows `User@x.com` when `user@x.com` exists) and open an issue as a "user report"
- [ ] Let the agent reproduce, find the root cause, add a regression test and fix it
- [ ] Write a short postmortem in `docs/postmortems/`

**Status:** [ ]

---

## Retro Log

Fill in after each phase.

| Phase | Saved time on | Needed rework | Where I had to step in | Change to setup |
| ----- | ------------- | ------------- | ---------------------- | --------------- |
| 0     |               |               |                        |                 |
| 1     |               |               |                        |                 |
| 2     |               |               |                        |                 |
| 3     |               |               |                        |                 |
| 4     |               |               |                        |                 |
| 5     |               |               |                        |                 |
