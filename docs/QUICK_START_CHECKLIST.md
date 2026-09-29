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

- [ ] `packages/types/src/entities/habit.ts`
- [ ] `packages/types/src/entities/completion.ts`
- [ ] `packages/types/src/dto/habit.dto.ts`
- [ ] `packages/types/src/index.ts`
- [ ] `packages/types/package.json`
- [ ] `packages/types/tsconfig.json`

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

- [ ] `packages/core/src/utils/date.ts`
- [ ] `packages/core/src/utils/streak.ts`
- [ ] `packages/core/src/constants/colors.ts`
- [ ] `packages/core/src/index.ts`

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

**Status:** [ ]

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

**Status:** [ ]

---

### 8. Run Migrations

```bash
npx prisma migrate dev --name initial
npx prisma generate
```

**Status:** [ ]

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

**Status:** [ ]

---

### 10. Create Backend Structure

```bash
cd apps/api
mkdir -p src/{config,middleware,routes,controllers,services,repositories,validators,utils,types}
mkdir -p tests/{unit,integration}
```

**Core files to create:**

- [ ] `src/config/env.ts`
- [ ] `src/config/database.ts`
- [ ] `src/middleware/auth.middleware.ts`
- [ ] `src/middleware/error.middleware.ts`
- [ ] `src/middleware/validation.middleware.ts`
- [ ] `src/utils/jwt.util.ts`
- [ ] `src/utils/password.util.ts`
- [ ] `src/app.ts`
- [ ] `src/server.ts`
- [ ] `.env.example`
- [ ] `tsconfig.json`

---

### 11. Implement Authentication

**Files to create:**

- [ ] `src/validators/auth.validator.ts`
- [ ] `src/services/auth.service.ts`
- [ ] `src/controllers/auth.controller.ts`
- [ ] `src/routes/auth.routes.ts`

**Test:** `POST /api/auth/register` and `/api/auth/login`

---

### 12. Implement Habits Module

**Files to create:**

- [ ] `src/validators/habits.validator.ts`
- [ ] `src/repositories/habits.repository.ts`
- [ ] `src/services/habits.service.ts`
- [ ] `src/controllers/habits.controller.ts`
- [ ] `src/routes/habits.routes.ts`

**Test:** CRUD operations for habits

---

### 13. Implement Completions Module

**Files to create:**

- [ ] `src/validators/completions.validator.ts`
- [ ] `src/repositories/completions.repository.ts`
- [ ] `src/services/completions.service.ts`
- [ ] `src/controllers/completions.controller.ts`
- [ ] `src/routes/completions.routes.ts`

---

### 14. Start Backend Server

```bash
cd apps/api
npm run dev

# Should see:
# ✅ Database connected
# 🚀 Server running on http://localhost:4000
```

**Status:** [ ]

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

- [ ] `src/client.ts`
- [ ] `src/utils/request.ts`
- [ ] `src/endpoints/auth.ts`
- [ ] `src/endpoints/habits.ts`
- [ ] `src/endpoints/completions.ts`
- [ ] `src/index.ts`

---

## Phase 6: Migrate Web App (Day 4-5)

### 16. Update Web App to Use API

```bash
cd apps/web

# Install dependencies
npm install @tanstack/react-query @repo/api-client @repo/types
```

**Status:** [ ]

---

### 17. Create API Hooks

**Files to create in apps/web:**

- [ ] `lib/api/client.ts` (initialize ApiClient)
- [ ] `lib/hooks/useAuth.ts`
- [ ] `lib/hooks/useHabits.ts`
- [ ] `lib/hooks/useCompletions.ts`

---

### 18. Update Components

Replace localStorage usage with API calls:

- [ ] Update `lib/habits/useHabitLog.ts` to use API
- [ ] Update components to use new hooks
- [ ] Add loading states
- [ ] Add error handling

---

### 19. Add Authentication UI

**Pages to create:**

- [ ] `app/(auth)/login/page.tsx`
- [ ] `app/(auth)/register/page.tsx`
- [ ] Protect dashboard routes

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

**Status:** [ ]

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
- [ ] Dark mode
- [ ] Internationalization

---

## Estimated Timeline

| Phase             | Duration       | Tasks                        |
| ----------------- | -------------- | ---------------------------- |
| **Setup**         | 1-2 days       | Monorepo, packages, database |
| **Backend**       | 2-3 days       | Express API, auth, CRUD      |
| **Web Migration** | 2-3 days       | Connect to API, update UI    |
| **Mobile App**    | 4-5 days       | Build React Native app       |
| **Testing**       | 2-3 days       | Write tests, fix bugs        |
| **Deployment**    | 2-3 days       | Deploy all services          |
| **Total**         | **14-20 days** | Full stack implementation    |

---

## Need Help?

Refer to these documents:

- `ARCHITECTURE.md` - Complete structure overview
- `EXPRESS_BACKEND_SETUP.md` - Backend implementation guide
- `README.md` - Project overview

Start with Phase 1 and work through sequentially. Each phase builds on the previous one.

Good luck! 🚀
