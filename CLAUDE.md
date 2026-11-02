@AGENTS.md

# Habits+

Habit tracker. npm workspaces + Turborepo. Mobile (`apps/mobile`) is out of scope - don't touch it.

| Path                  | What                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| `apps/api`            | Express + Prisma + Zod API on :4000, routes under `/api`             |
| `apps/web`            | Next.js + MUI + React Query + i18next on :3001 (see its `AGENTS.md`) |
| `packages/types`      | Shared DTOs, entities, enums (`@repo/types`)                         |
| `packages/api-client` | Typed HTTP client used by web (`@repo/api-client`)                   |
| `packages/core`       | Shared pure logic (`@repo/core`)                                     |
| `prisma/`             | Schema, migrations, seed (root-level, shared)                        |
| `e2e/`                | Playwright specs                                                     |
| `docs/`               | Plans, AI coach design (`AI_COACH.md`), `AI_SDLC_PLAN.md`            |

## Commands

```bash
npm run dev:api | dev:web      # one app; npm run dev for both
npm run typecheck              # all workspaces
npm run lint                   # ESLint (apps/web only has a config)
npm test                       # Jest: web, API unit + integration, packages
npm test --workspace=@habit-tracker/api
npm run test:e2e               # Playwright
npm run db:migrate             # create + apply a migration (never hand-edit migrations)
npm run db:seed                # demo@habits.plus / password
```

API integration tests and e2e need local Postgres (`habit_tracker_test`, `habit_tracker_e2e`, derived from `DATABASE_URL`).

## API conventions (`apps/api/src`)

A feature goes through these layers, one file each, named `<feature>.<layer>.ts`:

`validators` (Zod schema + inferred body type) -> `routes` (`validateRequest(schema)`, `authMiddleware`) -> `controllers` (class with arrow-method handlers, `try/catch` -> `next(error)`) -> `services` (business rules, ownership checks) -> `repositories` (only place that calls `prisma`, maps rows to `*Record` types).

- Register new routers in `routes/index.ts`.
- Throw `AppError(status, message)` from services for expected failures; 404 for "not yours" as well as "missing".
- `req.user!.id` is the authenticated user.
- Auth is an httpOnly session cookie or `Authorization: Bearer`.
- Unit tests sit next to the file (`*.test.ts`); HTTP tests go in `src/integration/*.integration.test.ts` with `registerUser()` + `resetDatabase()`.
- Update `apps/api/openapi.yaml` when an endpoint changes.
- AI coach code is in `src/ai/`; read `docs/AI_COACH.md` before changing it.

## Web conventions (`apps/web`)

- Read `apps/web/AGENTS.md`: this Next.js version differs from training data.
- Pages in `app/<route>/page.tsx` are thin: `generateMetadata` + one `*View` component.
- Components live in `components/<Name>/` with `<Name>.tsx`, `<Name>.style.ts` (MUI theme functions), `<Name>.interface.ts`, `<Name>.test.tsx`, `index.ts`.
- Data access: `lib/hooks/use<Feature>.ts` with React Query, `api` from `lib/api/client`, keys in `lib/api/query-keys.ts`, mappers in `lib/api/mappers.ts`.
- Forms: React Hook Form + Zod (`lib/forms/schemas.ts`).
- Every user-facing string goes in both `lib/i18n/locales/en.ts` and `uk.ts`.
- Tests render through `test/render.tsx` (theme + i18n).

## Shared contract

New endpoint: add DTOs to `packages/types` and a method to `packages/api-client/src/endpoints/<feature>.ts` (register on `ApiClient`) before writing web code.

## Commits

One line, Conventional Commits, enforced by commitlint (see `.cursorrules`): `type(scope): description`, at most 72 characters, lowercase imperative. **No body, no footer, no trailers** - commitlint rejects them. The pre-commit hook runs lint-staged and `npm run typecheck`.

## Definition of done

- Tests added or updated, and `npm test` passes for touched workspaces.
- `npm run typecheck` passes (a Stop hook checks changed workspaces automatically).
- en + uk strings, `openapi.yaml` updated when relevant.
- No secrets read or logged; `.env` is off-limits.

## Claude setup

- `.claude/settings.json`: allowed commands, denied paths (`.env`, `prisma/migrations/**`), hooks.
- `.claude/hooks/format-file.sh`: Prettier (+ ESLint in web) after every edit.
- `.claude/hooks/typecheck-changed.sh`: typecheck changed workspaces before finishing.
- `.claude/hooks/related-tests.sh`: Jest unit tests related to changed files before finishing (no integration/e2e).
- `.claude/hooks/openapi-drift.sh`: asks for an `openapi.yaml` update when routes/validators change without it.
- `.claude/hooks/notify.sh`: macOS notification when input is needed (registered in the gitignored `settings.local.json`).
- `.claude/skills/`: `/new-endpoint`, `/ship`.
