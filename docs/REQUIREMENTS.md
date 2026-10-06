# Habit log requirements

## Product

A personal log for habits you do every day. You add a habit, mark whether you did it today, and see a streak that grows when you keep going.

Charts and a wider dashboard come later. The first product is the logger.

## Version 1 (current)

An account is required. Habits and completions are stored in Postgres and loaded through the API.

- Add a habit by name and pick a color.
- For each habit, mark today done, or undo that mark.
- The home page is a month or week calendar. Each day lists the habits marked done that day.
- Adding a habit and marking today done happens on a separate log page.
- Show the last 7 days and the current streak on each habit.
- A streak is consecutive days completed. Today stays open until you log it, so a morning visit does not wipe yesterday’s run.
- English and Ukrainian UI. The first visit follows the browser language. A choice in the language switch is stored in a cookie and overrides that.
- Light and dark theme follow the system, with a manual toggle.

### Fit with the repo today

- The web app lives in `apps/web` (Next.js, React, TypeScript, MUI).
- The API lives in `apps/api` (Express, JWT auth, Prisma).
- Shared domain types live in `packages/types` (`@repo/types`). Shared date, streak, and habit-color helpers live in `packages/core` (`@repo/core`). The typed HTTP client lives in `packages/api-client`.
- Postgres schema and migrations live in `prisma/`.

## Later

- Charts and a summary dashboard
- Schedules other than every day
- Reminders and push notifications
- Native mobile apps (iOS and Android) that share the same API

## Related docs

`../README.md` is how to install and run the app. The other files in this folder are earlier setup notes.
