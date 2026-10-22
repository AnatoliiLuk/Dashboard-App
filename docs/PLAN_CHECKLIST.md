# Checklist Plan - Monorepo Setup

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

## Phase 9: Deployment (Day 15+)

### 28. Deploy the API and database

Personal deploy target: **$0/month on [Neon](https://neon.com) Free**. One Neon project holds the Postgres database and the API. Neon does not host the Next.js site. That stays in step 29.

| Piece    | Where                             | Cost | Limit on the free plan                                                                                                                                |
| -------- | --------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Postgres | Neon database                     | $0   | 1 GB storage. Compute sleeps after about 5 minutes with no queries. Data stays.                                                                       |
| API      | Neon Function on the same project | $0   | 10 active hours, 400 waiting hours, and 1 million calls a month. Idle time is not billed. Past the allowance the function stops until the next month. |

Create the Neon project in a region that offers Functions: AWS US East (Ohio or N. Virginia), Europe (Frankfurt), or Asia Pacific (Singapore).

The API in this repo starts with `app.listen`. A Neon Function expects a `fetch(request)` handler, and Neon injects `DATABASE_URL`. That adapter is not in the repo yet, so the current start script cannot be deployed as-is.

- [ ] Create a Neon project in a Functions region
- [ ] Copy the direct connection string and run `npx prisma migrate deploy` against it
- [ ] Add a `fetch` entry that serves the existing Express app
- [ ] Set `JWT_SECRET` (at least 32 characters) and `JWT_EXPIRES_IN=7d` on the function
- [ ] Set `CORS_ORIGINS` to the web origin from step 29
- [ ] Deploy with `neon functions deploy` and open the function URL `/health`

---

### 29. Deploy the web app

[Vercel Hobby](https://vercel.com/pricing) is **$0** for a personal, non-commercial project. Neon does not run this Next.js app. The `*.vercel.app` address is included. A custom domain name is optional and is the only extra cost, usually about $10–15 a year from a registrar. Vercel Pro ($20/month) matters only if the site is commercial.

Import the GitHub repo. Set the root directory to `apps/web`.

- [ ] Set `NEXT_PUBLIC_API_URL` to the Neon function URL, including the `/api` prefix, before the production build. Next reads it at build time.
- [ ] Deploy
- [ ] Add `https://<project>.vercel.app` to the function `CORS_ORIGINS`, then redeploy the function
- [ ] Register on the live site and log a habit

The first request after a quiet period can be slow, because the free database sleeps. That is the trade for $0.

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

- [x] Comprehensive tests
- [x] API documentation
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
