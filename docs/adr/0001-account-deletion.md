# ADR 0001: Account Deletion

**Status:** Accepted
**Date:** 2026-11-02
**Spec:** [Account page](../specs/account-page.md)

## Context

The account page lets a person delete their account. Every relation on `User`
already has `onDelete: Cascade` (habits, completions, goals, goal habits through
habits and goals, `ai_usage`, `coach_conversations`, `coach_messages`). The
schema comment on `AiUsage` and `docs/AI_COACH.md` already say these rows go
with the user.

The open question is whether "delete" should really remove the rows, and what
happens to `ai_usage`, which `scripts/usage-report.ts` uses to report cost.

## Options

### A. Hard delete with cascade

`prisma.user.delete()` in one transaction. Postgres removes every dependent row.

- Matches what the schema and the coach docs already promise.
- Nothing to filter out in other queries; no "deleted" state to test.
- Strongest privacy story: coach messages and habit names are gone at once.
- No undo. A mistaken delete cannot be recovered except from a backup.
- Past AI cost for that user disappears from `usage-report`.

### B. Soft delete (`deletedAt` on `User`), purge later

Mark the user deleted, block login, purge after N days with a scheduled script.

- Allows an undo window.
- Every query and the auth check must exclude deleted users, or data leaks
  back. Unique email has to be released (rename or partial index).
- Personal data, including coach messages, stays for N days after the person
  asked for it to go.
- Needs a scheduled job that we do not run yet.

### C. Hard delete, but keep anonymized `ai_usage`

Like A, but `ai_usage.userId` becomes nullable with `onDelete: SetNull`.

- Keeps cost history for reporting.
- Usage rows carry no message content, so the privacy cost is low, but
  timestamps plus token counts are still per-person activity.
- Needs a schema migration and changes `usage-report` and the budget query to
  handle `null`.

## Decision

**A. Hard delete with cascade.** It is what the code and docs already promise,
it is the least code, and there is no current need for cost history beyond the
provider console. Require the password to confirm, and run it in one
transaction.

If aggregate cost history is needed later, add a daily aggregate table that has
no `userId` rather than keeping per-user rows (a better version of C).

## Consequences

- Phase 2 must confirm every `User` relation cascades and add an integration
  test that deletes a user with data in every table.
- No undo. The confirmation dialog must say so plainly.
- Live tokens for the deleted user must be rejected; see ADR 0002.
- `usage-report` totals for past days drop when a user is deleted.
