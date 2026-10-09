# Habits+ web

Next.js app for the calendar and the habit log. It talks to the API through `@repo/api-client`.

From the repo root:

```bash
npm run dev:web
```

Open [http://localhost:3001](http://localhost:3001). The API should already be running on port 4000.

## Environment

Copy `apps/web/.env.example` to `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Pages

| Path        | Who can open it     |
| ----------- | ------------------- |
| `/`         | Signed-in calendar  |
| `/log`      | Signed-in habit log |
| `/login`    | Guest sign-in       |
| `/register` | Guest registration  |

The signed-in token is stored in `localStorage` under `habits-plus-token`.

## Language

English and Ukrainian. The first visit follows the browser language. Choosing EN or UK writes the `habit-locale` cookie, and that cookie wins on the next request. Form labels update immediately. The browser tab title updates on the next request.

## Forms

Login, register, and the new-habit form use React Hook Form and Zod. The browser shows a translated message and skips the request when the value is invalid. The API checks the same limits again.

## Tests

```bash
npm test --workspace=@habit-tracker/web
```
