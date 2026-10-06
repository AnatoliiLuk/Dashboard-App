# Quick Start Checklist - Monorepo Setup

## Phase 1: Initial Setup (Day 1)

### 1. Create Monorepo Structure

```bash
# From /workspace
mkdir -p apps/{web,api,mobile}
mkdir -p packages/{types,api-client,core}
mkdir -p prisma/migrations
```

**Status:** [x]

---

### 2. Initialize Turborepo

```bash
# Root package.json
npm init -y

# Install Turborepo
npm install turbo -D

# Create turbo.json (see ARCHITECTURE.md)
```

**Status:** [x]

---

### 3. Move Existing Web App

```bash
# Your current app becomes apps/web
# Move all current files to apps/web/
# Keep: app/, components/, lib/, public/, package.json, etc.
```

**Status:** [x]

---

## Phase 2: Shared Packages (Day 1-2)

### 4. Create Types Package

```bash
cd packages/types
npm init -y

# Create structure
mkdir -p src/{entities,dto,enums}

# Files to create:
# - src/entities/habit.ts
# - src/entities/completion.ts
# - src/entities/user.ts
# - src/dto/habit.dto.ts
# - src/enums/habit-color.enum.ts
# - src/index.ts (exports everything)
```

**Files created:**

- [x] `packages/types/src/entities/habit.ts`
- [x] `packages/types/src/entities/completion.ts`
- [x] `packages/types/src/dto/habit.dto.ts`
- [x] `packages/types/src/index.ts`
- [x] `packages/types/package.json`
- [x] `packages/types/tsconfig.json`

---

### 5. Create Core Package

```bash
cd packages/core
npm init -y

# Move shared utilities from lib/habits/
# - dates.ts
# - streaks.ts
# - colors.ts
```

**Files created:**

- [x] `packages/core/src/utils/date.ts`
- [x] `packages/core/src/utils/streak.ts`
- [x] `packages/core/src/constants/colors.ts`
- [x] `packages/core/src/index.ts`

---

## Phase 3: Database (Day 2)

### 6. Setup Prisma

```bash
cd /workspace
npm install prisma @prisma/client

# Initialize
npx prisma init

# Copy schema from ARCHITECTURE.md to prisma/schema.prisma
```

**Status:** [x]

---

### 7. Configure Database

```bash
# Create local PostgreSQL database
createdb habit_tracker

# Or use Docker
docker run --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=habit_tracker \
  -p 5432:5432 \
  -d postgres:15

# Update .env with DATABASE_URL
```

**Status:** [x]

---

### 8. Run Migrations

```bash
npx prisma migrate dev --name initial
npx prisma generate
```

**Status:** [x]

---

## Phase 4: Backend API (Day 2-3)

### 9. Initialize Express Backend

```bash
cd apps/api
npm init -y

# Install dependencies (see EXPRESS_BACKEND_SETUP.md)
npm install express cors helmet dotenv jsonwebtoken bcryptjs zod
npm install @prisma/client
npm install -D typescript @types/express tsx
```

**Status:** [x]

---

### 10. Create Backend Structure

```bash
cd apps/api
mkdir -p src/{config,middleware,routes,controllers,services,repositories,validators,utils,types}
mkdir -p tests/{unit,integration}
```

**Core files to create:**

- [x] `src/config/env.ts`
- [x] `src/config/database.ts`
- [x] `src/middleware/auth.middleware.ts`
- [x] `src/middleware/error.middleware.ts`
- [x] `src/middleware/validation.middleware.ts`
- [x] `src/utils/jwt.util.ts`
- [x] `src/utils/password.util.ts`
- [x] `src/app.ts`
- [x] `src/server.ts`
- [x] `.env.example`
- [x] `tsconfig.json`

---

### 11. Implement Authentication

**Files to create:**

- [x] `src/validators/auth.validator.ts`
- [x] `src/services/auth.service.ts`
- [x] `src/controllers/auth.controller.ts`
- [x] `src/routes/auth.routes.ts`

**Test:** `POST /api/auth/register` and `/api/auth/login`

**Status:** [x]

---

### 12. Implement Habits Module

**Files to create:**

- [x] `src/validators/habits.validator.ts`
- [x] `src/repositories/habits.repository.ts`
- [x] `src/services/habits.service.ts`
- [x] `src/controllers/habits.controller.ts`
- [x] `src/routes/habits.routes.ts`

**Test:** CRUD operations for habits

**Status:** [x]

---

### 13. Implement Completions Module

**Files to create:**

- [x] `src/validators/completions.validator.ts`
- [x] `src/repositories/completions.repository.ts`
- [x] `src/services/completions.service.ts`
- [x] `src/controllers/completions.controller.ts`
- [x] `src/routes/completions.routes.ts`

**Status:** [x]

---

### 14. Start Backend Server

```bash
# From repo root
npm run dev:api

# Or everything (web + api)
npm run dev

# Should see:
# Database connected
# Server running on http://localhost:4000
```

**Verified:**

- [x] `GET /health` → ok
- [x] `GET /api` → Habits+ API info
- [x] Auth / habits / completions mounted (401 without token)

**Status:** [x]

---

## Phase 5: API Client Package (Day 3-4)

### 15. Create API Client

```bash
cd packages/api-client
npm init -y
npm install @repo/types

mkdir -p src/{endpoints,utils}
```

**Files to create:**

- [x] `src/client.ts`
- [x] `src/utils/request.ts`
- [x] `src/endpoints/auth.ts`
- [x] `src/endpoints/habits.ts`
- [x] `src/endpoints/completions.ts`
- [x] `src/index.ts`

**Status:** [x]

---

## Phase 6: Migrate Web App (Day 4-5)

### 16. Update Web App to Use API

```bash
cd apps/web

# Install dependencies
npm install @tanstack/react-query @repo/api-client @repo/types
```

**Done:**

- [x] Installed `@tanstack/react-query`, `@repo/api-client`, `@repo/types`
- [x] Transpile `@repo/api-client` in `next.config.ts`
- [x] Wrap app with `QueryClientProvider` in `app/providers.tsx`
- [x] `apps/web/.env.example` + `.env.local` with `NEXT_PUBLIC_API_URL`

**Status:** [x]

---

### 17. Create API Hooks

**Files to create in apps/web:**

- [x] `lib/api/client.ts` (initialize ApiClient)
- [x] `lib/hooks/useAuth.ts`
- [x] `lib/hooks/useHabits.ts`
- [x] `lib/hooks/useCompletions.ts`

Also: `lib/api/token.ts`, `lib/api/mappers.ts`, `lib/api/query-keys.ts`, `lib/hooks/index.ts`

**Status:** [x]

---

### 18. Update Components

Replace localStorage usage with API calls:

- [x] Update `lib/habits/useHabitLog.ts` to use API
- [x] Update components to use new hooks
- [x] Add loading states
- [x] Add error handling

**Note:** Without a JWT (task 19 login UI), Home/Log show a sign-in required message.

**Status:** [x]

---

### 19. Add Authentication UI

**Pages to create:**

- [x] `app/(auth)/login/page.tsx`
- [x] `app/(auth)/register/page.tsx`
- [x] Protect dashboard routes

**Status:** [x]

---

### 20. Test Web App

```bash
cd apps/web
npm run dev

# Test:
# 1. Register new account
# 2. Login
# 3. Create habit
# 4. Log completion
# 5. View calendar
```

**Status:** [x]

---

## Phase 7: Mobile App (Day 6-10)

### 21. Initialize React Native App

```bash
cd apps
npx create-expo-app mobile --template tabs

cd mobile
npm install @repo/api-client @repo/types
npm install @tanstack/react-query
npm install @react-native-async-storage/async-storage
```

**Status:** [ ]

---

### 22. Setup API Client for Mobile

**Files to create:**

- [ ] `lib/api/client.ts`
- [ ] `lib/storage/token.ts` (AsyncStorage)
- [ ] `hooks/useAuth.ts`
- [ ] `hooks/useHabits.ts`

---

### 23. Build Mobile Screens

**Screens to create:**

- [ ] `app/(auth)/login.tsx`
- [ ] `app/(auth)/register.tsx`
- [ ] `app/(tabs)/index.tsx` (Calendar)
- [ ] `app/(tabs)/log.tsx` (Log habits)
- [ ] `app/(tabs)/habits.tsx` (Manage habits)
- [ ] `app/(tabs)/settings.tsx`

---

### 24. Test Mobile App

```bash
cd apps/mobile
npm start

# Test on:
# - iOS Simulator
# - Android Emulator
# - Physical device
```

**Status:** [ ]

---

## Phase 8: Testing & Polish (Day 11-14)

### 25. Write Tests

**Backend tests:**

- [ ] `apps/api/tests/integration/auth.test.ts`
- [ ] `apps/api/tests/integration/habits.test.ts`
- [ ] `apps/api/tests/unit/services/habits.service.test.ts`

**Frontend tests:**

- [ ] `apps/web/components/HabitCard/HabitCard.test.tsx`
- [ ] `apps/web/lib/hooks/useHabits.test.ts`

---

### 26. Add Documentation

- [ ] Update root `README.md`
- [ ] Create `apps/api/README.md`
- [ ] Create `apps/web/README.md`
- [ ] Create `apps/mobile/README.md`
- [ ] Document API endpoints (Swagger/OpenAPI)

---

### 27. Setup CI/CD

- [ ] Create `.github/workflows/ci.yml`
- [ ] Add linting to CI
- [ ] Add tests to CI
- [ ] Add type checking to CI

---

## Phase 9: Deployment (Day 15+)

### 28. Deploy Backend

**Choose platform:**

- [ ] Railway: `railway up`
- [ ] Render: Connect repo
- [ ] DigitalOcean App Platform
- [ ] AWS/GCP/Azure

**Setup:**

- [ ] Configure environment variables
- [ ] Setup production database
- [ ] Test API endpoints

---

### 29. Deploy Web App

```bash
cd apps/web

# Vercel
vercel deploy

# Or Netlify
netlify deploy
```

**Configure:**

- [ ] Set `NEXT_PUBLIC_API_URL` to production API
- [ ] Setup custom domain
- [ ] Test production build

---

### 30. Deploy Mobile App

```bash
cd apps/mobile

# Build
eas build --platform ios
eas build --platform android

# Submit
eas submit --platform ios
eas submit --platform android
```

---

## Summary Checklist

### Must Have Before Launch:

- [ ] Backend API running and tested
- [ ] Database with migrations
- [ ] Authentication working
- [ ] CRUD operations for habits and completions
- [ ] Web app connected to API
- [ ] Mobile app connected to API
- [ ] Basic error handling
- [ ] Loading states

### Nice to Have:

- [ ] Comprehensive tests
- [ ] API documentation
- [ ] Email notifications
- [ ] Push notifications
- [ ] Data export
- [ ] Analytics

### Future Enhancements:

- [ ] Social features (share habits)
- [ ] Habit templates
- [ ] AI suggestions
- [ ] Team/family habits
- [ ] Gamification (badges, streaks)
- [x] Dark mode
- [x] Internationalization

---
