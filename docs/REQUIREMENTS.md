# Habit log requirements

## Product

A personal log for habits you do every day. You add a habit, mark whether you did it today, and see a streak that grows when you keep going.

Charts and a wider dashboard come later. The first product is the logger.

## Version 1 (current)

One person, no login. Habits and completions stay in the browser for one local user id.

- Add a habit by name and pick a color.
- For each habit, mark today done, or undo that mark.
- The home page is a month or week calendar. Each day lists the habits marked done that day.
- Adding a habit and marking today done happens on a separate log page.
- Show the last 7 days and the current streak on each habit.
- A streak is consecutive days completed. Today stays open until you log it, so a morning visit does not wipe yesterday’s run.
- Refreshing the page keeps the data.
- English and Ukrainian UI, with the language stored in a cookie so the first paint matches.
- Light and dark theme follow the system, with a manual toggle.

### Fit with the repo today

- The web app lives in `apps/web` (Next.js, React, TypeScript, MUI).
- Shared domain types live in `packages/types` (`@repo/types`). Shared date, streak, and habit-color helpers live in `packages/core` (`@repo/core`). The web app re-exports them from `apps/web/lib/habits`.
- Habit log UI state and local storage still live under `apps/web/lib/habits`.
- The repo root is a Turborepo monorepo. The Express API, Prisma, API client, and mobile folders are ready for later phases.

## Later (architecture target)

These match the monorepo plan in `ARCHITECTURE.md` and the phased checklist in `QUICK_START_CHECKLIST.md`.

### Product

- Signup, login, and sync across devices
- Charts and a summary dashboard
- Schedules other than every day
- Reminders and push notifications
- Native mobile apps (iOS and Android) that share the same API

### Platform

- Express API in `apps/api` with controllers, services, and repositories
- PostgreSQL with Prisma at the repo root (`prisma/schema.prisma`, migrations applied locally)
- Shared packages: `packages/types`, `packages/core` (done); `packages/api-client` next
- Web and mobile both talk to the API through the shared client
- Auth with JWT (register, login, protected habit and completion routes)

## Related docs

| Doc                        | Use it for                                  |
| -------------------------- | ------------------------------------------- |
| `ARCHITECTURE.md`          | Full monorepo layout and key file shapes    |
| `ARCHITECTURE_DIAGRAM.md`  | Request flow through layers                 |
| `EXPRESS_BACKEND_SETUP.md` | Building the API step by step               |
| `QUICK_START_CHECKLIST.md` | Ordered phases (Phase 1 done; Phase 2 next) |
| `QUICK_REFERENCE.md`       | Day-to-day commands and snippets            |
| `../README.md`             | How to install and run the web app          |
