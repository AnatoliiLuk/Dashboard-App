---
name: ship
description: Verify, commit, push and open a pull request for the current work in this repo.
argument-hint: [optional PR title or issue number]
disable-model-invocation: true
---

# Ship the current work

Context: $ARGUMENTS

## 1. Look before acting

- `git status` and `git diff` - list what will ship. If unrelated files are modified, ask which ones to include.
- If the branch is `main`, create a branch first: `<type>/<short-kebab-name>` (for example `feat/account-profile`).

## 2. Verify

Typecheck is already covered by the Stop hook and the pre-commit hook, so don't run it here. Run for the touched workspaces only, and stop on the first failure:

1. `npm run lint` (if `apps/web` changed)
2. `npm test --workspace=<each touched workspace>`
3. `npm run spellcheck` if docs or strings changed

If something fails, report the error and fix it before going on. Never skip hooks with `--no-verify`.

## 3. Commit

- Stage files explicitly by path, never `git add -A`.
- Exactly one line, Conventional Commits, at most 72 characters, lowercase imperative, 3-7 word description. Rules are in `.cursorrules`.
- **No body, no footer, no `Co-Authored-By` trailer** - commitlint rejects them.
- Several logical changes: make several one-line commits.

## 4. Push and open the PR

- `git push -u origin <branch>`
- `gh pr create` with:
  - Title: the main commit line
  - Body: `## What`, `## Why` (link the issue if given), `## How to test` (commands and manual steps), `## Notes` (follow-ups, risks)
- Print the PR URL.
