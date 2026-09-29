# Architecture Diagram - Visual Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────────┐              ┌──────────────────┐           │
│   │   Web App        │              │   Mobile App     │           │
│   │   (Next.js)      │              │   (React Native) │           │
│   │                  │              │                  │           │
│   │  - Calendar View │              │  - Calendar View │           │
│   │  - Habit Logging │              │  - Habit Logging │           │
│   │  - Statistics    │              │  - Push Notifs   │           │
│   │                  │              │  - Offline Mode  │           │
│   └────────┬─────────┘              └────────┬─────────┘           │
│            │                                  │                     │
│            └──────────────┬───────────────────┘                     │
│                           │                                         │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                    SHARED PACKAGES (Monorepo)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │   Types    │  │    Core    │  │ API Client │  │  UI (opt)  │   │
│  │            │  │            │  │            │  │            │   │
│  │ - Habit    │  │ - Dates    │  │ - Request  │  │ - HabitCard│   │
│  │ - User     │  │ - Streaks  │  │ - Auth     │  │ - Calendar │   │
│  │ - DTOs     │  │ - Colors   │  │ - Habits   │  │            │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
│                                                                      │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                │ Used by all apps
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                       BACKEND API (Express)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Routes Layer                             │    │
│  │  /api/auth  |  /api/habits  |  /api/completions           │    │
│  └─────────────────────┬──────────────────────────────────────┘    │
│                        │                                            │
│  ┌─────────────────────▼──────────────────────────────────────┐    │
│  │                 Controllers Layer                           │    │
│  │  AuthController | HabitsController | CompletionsController │    │
│  └─────────────────────┬──────────────────────────────────────┘    │
│                        │                                            │
│  ┌─────────────────────▼──────────────────────────────────────┐    │
│  │                  Services Layer                             │    │
│  │  AuthService    |  HabitsService   |  CompletionsService   │    │
│  │  (Business Logic)                                           │    │
│  └─────────────────────┬──────────────────────────────────────┘    │
│                        │                                            │
│  ┌─────────────────────▼──────────────────────────────────────┐    │
│  │               Repositories Layer                            │    │
│  │  HabitsRepo     | CompletionsRepo  |  UsersRepo            │    │
│  │  (Data Access)                                              │    │
│  └─────────────────────┬──────────────────────────────────────┘    │
│                        │                                            │
└────────────────────────┼────────────────────────────────────────────┘
                         │
                         │ Prisma ORM
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐     ┌──────────┐     ┌──────────────┐               │
│  │  Users   │     │  Habits  │     │  Completions │               │
│  │          │────▶│          │────▶│              │               │
│  │ - id     │     │ - id     │     │ - id         │               │
│  │ - email  │     │ - name   │     │ - habitId    │               │
│  │ - pass   │     │ - color  │     │ - date       │               │
│  │ - name   │     │ - userId │     │ - userId     │               │
│  └──────────┘     └──────────┘     └──────────────┘               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Example

### Creating a Habit

```
┌─────────────┐
│   Client    │  User clicks "Create Habit"
│  (Web/App)  │
└──────┬──────┘
       │
       │ 1. POST /api/habits
       │    { name: "Exercise", color: "green" }
       │    Authorization: Bearer <token>
       │
       ▼
┌─────────────────┐
│  Middleware     │  2. Validate JWT token
│  (auth)         │     Extract user info from token
└──────┬──────────┘
       │
       │ 3. req.user = { id: "user123", email: "..." }
       │
       ▼
┌─────────────────┐
│  Middleware     │  4. Validate request body with Zod
│  (validation)   │     Check: name exists, color is valid
└──────┬──────────┘
       │
       │ 5. Validated data passed to controller
       │
       ▼
┌─────────────────┐
│  Controller     │  6. Extract data from request
│  (habits)       │     Call service layer
└──────┬──────────┘
       │
       │ 7. service.create(name, color, userId)
       │
       ▼
┌─────────────────┐
│   Service       │  8. Business logic
│  (habits)       │     - Additional validation
│                 │     - Business rules
└──────┬──────────┘
       │
       │ 9. repository.create({ name, color, userId })
       │
       ▼
┌─────────────────┐
│  Repository     │  10. Database query with Prisma
│  (habits)       │      prisma.habit.create(...)
└──────┬──────────┘
       │
       │ 11. INSERT INTO habits ...
       │
       ▼
┌─────────────────┐
│   Database      │  12. Store record
│  (PostgreSQL)   │      Return created habit
└──────┬──────────┘
       │
       │ 13. Habit object with ID
       │
       ▼
┌─────────────────┐
│  Repository     │  14. Return to service
└──────┬──────────┘
       │
       │ 15. Return to controller
       │
       ▼
┌─────────────────┐
│  Controller     │  16. Format response
│                 │      res.status(201).json(habit)
└──────┬──────────┘
       │
       │ 17. HTTP Response
       │     Status: 201 Created
       │     Body: { id: "...", name: "Exercise", ... }
       │
       ▼
┌─────────────────┐
│    Client       │  18. Update UI with new habit
│   (Web/App)     │      Show success message
└─────────────────┘
```

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    MONOREPO STRUCTURE                         │
└──────────────────────────────────────────────────────────────┘

habit-tracker/
│
├── apps/
│   │
│   ├── web/                          ┌─────────────────┐
│   │   ├── app/                      │   Browser       │
│   │   │   ├── page.tsx      ───────▶│   localhost:3000│
│   │   │   └── api/          (uses)  └─────────────────┘
│   │   ├── components/
│   │   └── lib/
│   │       └── hooks/
│   │           └── useHabits.ts ────┐
│   │                                 │
│   ├── mobile/                       │
│   │   ├── app/                      │  ┌─────────────────┐
│   │   │   └── (tabs)/       ───────┼─▶│  Mobile Device  │
│   │   ├── components/       (uses) │  │  Expo App       │
│   │   └── hooks/                   │  └─────────────────┘
│   │       └── useHabits.ts ────────┤
│   │                                 │
│   └── api/                          │
│       └── src/                      │
│           ├── routes/               │
│           ├── controllers/  ◀───────┘
│           ├── services/
│           └── repositories/
│                   │
│                   │ Prisma
│                   ▼
│              PostgreSQL
│
├── packages/
│   │
│   ├── types/              ◀─── Used by all apps
│   │   └── src/
│   │       ├── entities/
│   │       └── dto/
│   │
│   ├── api-client/         ◀─── Used by web & mobile
│   │   └── src/
│   │       ├── client.ts
│   │       └── endpoints/
│   │
│   └── core/               ◀─── Shared utilities
│       └── src/
│           └── utils/
│
└── prisma/
    └── schema.prisma       ─────▶ Generates @prisma/client
```

---

## Layer Responsibilities

### 1. Routes Layer

```typescript
// RESPONSIBILITY: HTTP endpoint definition, request routing

router.post(
  '/habits',
  authMiddleware, // ← Authentication
  validateRequest(schema), // ← Validation
  controller.create, // ← Delegate to controller
);
```

### 2. Controllers Layer

```typescript
// RESPONSIBILITY: HTTP request/response handling, data extraction

export class HabitsController {
  async create(req: Request, res: Response) {
    const { name, color } = req.body; // ← Extract from HTTP
    const userId = req.user.id; // ← From auth middleware

    const habit = await service.create(name, color, userId);

    res.status(201).json(habit); // ← Format HTTP response
  }
}
```

### 3. Services Layer

```typescript
// RESPONSIBILITY: Business logic, orchestration, validation

export class HabitsService {
  async create(name: string, color: string, userId: string) {
    // Business logic
    if (await this.hasReachedLimit(userId)) {
      throw new Error('Habit limit reached');
    }

    // Delegate to repository
    return this.repository.create({ name, color, userId });
  }
}
```

### 4. Repositories Layer

```typescript
// RESPONSIBILITY: Data access, database queries

export class HabitsRepository {
  async create(data: CreateHabitInput) {
    // Pure database interaction
    return prisma.habit.create({ data });
  }
}
```

---

## Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /api/auth/register
     │    { email, password, name }
     │
     ▼
┌─────────────────┐
│  AuthController │  2. Extract credentials
└────┬────────────┘
     │
     │ 3. authService.register(...)
     │
     ▼
┌────────────────┐
│  AuthService   │  4. Hash password with bcrypt
│                │  5. Create user in database
│                │  6. Generate JWT token
└────┬───────────┘
     │
     │ 7. Return { user, token }
     │
     ▼
┌──────────┐
│  Client  │  8. Store token (localStorage/AsyncStorage)
└────┬─────┘
     │
     │ 9. Subsequent requests include:
     │    Authorization: Bearer <token>
     │
     ▼
┌──────────────────┐
│  authMiddleware  │  10. Verify JWT
│                  │  11. Attach user to req.user
└──────────────────┘
```

---

## Error Handling Flow

```
Any Layer
    │
    │ throw new AppError(404, 'Habit not found')
    │ OR
    │ throw new Error('Something went wrong')
    │
    ▼
┌─────────────────────┐
│  errorMiddleware    │  Catches all errors
│  (Express last MW)  │
└──────┬──────────────┘
       │
       ├─ If AppError (operational):
       │  └─▶ { status: 'error', message: 'Habit not found' }
       │      HTTP Status: 404
       │
       └─ If generic Error (programming):
          └─▶ { status: 'error', message: 'Internal server error' }
              HTTP Status: 500
              (Log full error for debugging)
```

---

## Security Layers

```
┌─────────────────────────────────────┐
│         1. HTTPS                    │  Transport Layer Security
├─────────────────────────────────────┤
│         2. Helmet                   │  Security headers
├─────────────────────────────────────┤
│         3. CORS                     │  Cross-origin protection
├─────────────────────────────────────┤
│         4. Rate Limiting            │  DDoS protection
├─────────────────────────────────────┤
│         5. JWT Verification         │  Authentication
├─────────────────────────────────────┤
│         6. Input Validation (Zod)   │  Prevent injection
├─────────────────────────────────────┤
│         7. Authorization            │  Check permissions
├─────────────────────────────────────┤
│         8. Prisma (SQL Injection)   │  Parameterized queries
└─────────────────────────────────────┘
```

---

## Development vs Production

### Development

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Web App    │      │     API      │      │   Database   │
│ localhost    │─────▶│ localhost    │─────▶│   Local      │
│   :3000      │      │   :4000      │      │   Postgres   │
└──────────────┘      └──────────────┘      └──────────────┘

┌──────────────┐
│  Mobile App  │─────▶ Same API (:4000)
│   Expo       │
└──────────────┘
```

### Production

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Web App    │      │     API      │      │   Database   │
│   Vercel     │─────▶│   Railway    │─────▶│   Neon/      │
│ yourapp.com  │      │  api.app.com │      │   Supabase   │
└──────────────┘      └──────────────┘      └──────────────┘

┌──────────────┐
│  Mobile App  │─────▶ Same API
│ iOS/Android  │
└──────────────┘
```

---

## Summary

This architecture provides:

✅ **Separation of Concerns**: Each layer has clear responsibility  
✅ **Code Reuse**: Shared packages used by all apps  
✅ **Type Safety**: TypeScript types shared across stack  
✅ **Scalability**: Each service can scale independently  
✅ **Maintainability**: Easy to find and fix issues  
✅ **Testability**: Each layer can be tested in isolation  
✅ **Security**: Multiple layers of protection  
✅ **Flexibility**: Easy to add new features or platforms
