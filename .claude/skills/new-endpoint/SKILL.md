---
name: new-endpoint
description: Add a new API endpoint end to end in this repo - Zod validator, route, controller, service, repository, shared DTO, api-client method, web React Query hook, tests and openapi.yaml. Use when the user asks for a new endpoint or a new action on an existing resource.
argument-hint: <METHOD /path - what it does>
---

# New endpoint: $ARGUMENTS

Follow the layer conventions in the root `CLAUDE.md`. Copy the shape of the closest existing feature (`goals` is the reference) instead of inventing a new pattern.

## 1. Pin down the contract first

Before writing code, state in 3-5 lines:

- Method, path, auth required or not
- Request body / params and their limits
- Response shape and status codes, including every error (`400`, `401`, `404`, `409`)
- Which existing feature file it belongs to, or whether it needs a new `<feature>.*.ts` set

If any of this is ambiguous, ask the user before continuing.

## 2. Tests first

- Validator unit test next to the validator (`*.validator.test.ts`) when there is a body.
- Integration test in `apps/api/src/integration/<feature>.integration.test.ts` using `registerUser()` and `resetDatabase()`. Cover the happy path, validation failure, unauthenticated, and another user's resource.
- Run `npm test --workspace=@habit-tracker/api` and confirm the new tests fail for the expected reason.

## 3. API layers (in this order)

1. `validators/<feature>.validator.ts` - Zod schema + exported inferred type
2. `repositories/<feature>.repository.ts` - Prisma calls only, return `*Record` types
3. `services/<feature>.service.ts` - rules and ownership checks, throw `AppError`
4. `controllers/<feature>.controller.ts` - arrow-method handler, `try/catch` -> `next(error)`
5. `routes/<feature>.routes.ts` - `authMiddleware`, `validateRequest(schema)`; register new routers in `routes/index.ts`

Schema change needed? Edit `prisma/schema.prisma` and tell the user to run `npm run db:migrate -- --name <name>`. Never write files in `prisma/migrations/` by hand.

## 4. Shared contract

- DTO in `packages/types/src/dto/<feature>.dto.ts`, exported from `packages/types/src/index.ts`
- Response type in `packages/api-client/src/types/api.ts`
- Method in `packages/api-client/src/endpoints/<feature>.ts`; new endpoint classes are registered on `ApiClient` and exported from `index.ts`

## 5. Web hook (only if the UI needs it now)

- `apps/web/lib/hooks/use<Feature>.ts` with `useQuery` / `useMutation`, keys in `lib/api/query-keys.ts`, invalidate on success
- Hook test if it has logic beyond a pass-through

## 6. Docs and verification

- Add the path to `apps/api/openapi.yaml`
- `npm test --workspace=@habit-tracker/api` and `npm run typecheck` pass
- Summarize: files touched, the contract, anything deferred
