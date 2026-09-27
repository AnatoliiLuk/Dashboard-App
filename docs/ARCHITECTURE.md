# Monorepo Architecture - Habit Tracker (Web + Mobile)

## Overview

This document outlines the complete monorepo structure for the Habit Tracker application with:
- **Web App**: Next.js (React)
- **Mobile Apps**: React Native (iOS + Android)
- **Backend API**: Express.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Shared Packages**: Types, API Client, Utilities

---

## Project Structure

```
habit-tracker/
├── apps/
│   ├── web/                    # Next.js web application
│   ├── mobile/                 # React Native mobile app (Expo)
│   └── api/                    # Express.js backend API
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── api-client/             # API SDK for web & mobile
│   ├── core/                   # Shared business logic
│   ├── ui/                     # Shared UI components (optional)
│   └── eslint-config/          # Shared ESLint configuration
├── prisma/                     # Database schema and migrations
├── turbo.json                  # Turborepo configuration
├── package.json                # Root package.json
└── README.md
```

---

## Detailed Structure

### 1. Backend API (`apps/api/`)

```
apps/api/
├── src/
│   ├── config/
│   │   ├── database.ts         # Prisma client setup
│   │   ├── auth.ts             # JWT configuration
│   │   └── env.ts              # Environment variables validation
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT authentication
│   │   ├── error.middleware.ts # Global error handler
│   │   ├── validation.middleware.ts # Request validation
│   │   └── logger.middleware.ts # Request logging
│   ├── routes/
│   │   ├── index.ts            # Route aggregator
│   │   ├── auth.routes.ts      # POST /api/auth/login, /register
│   │   ├── habits.routes.ts    # CRUD for habits
│   │   ├── completions.routes.ts # CRUD for completions
│   │   └── users.routes.ts     # User management
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── habits.controller.ts
│   │   ├── completions.controller.ts
│   │   └── users.controller.ts
│   ├── services/
│   │   ├── auth.service.ts     # Authentication logic
│   │   ├── habits.service.ts   # Business logic for habits
│   │   ├── completions.service.ts
│   │   ├── email.service.ts    # Email sending
│   │   └── notification.service.ts # Push notifications
│   ├── repositories/
│   │   ├── habits.repository.ts # Database access for habits
│   │   ├── completions.repository.ts
│   │   └── users.repository.ts
│   ├── validators/
│   │   ├── auth.validator.ts   # Validation schemas (Zod)
│   │   ├── habits.validator.ts
│   │   └── completions.validator.ts
│   ├── utils/
│   │   ├── jwt.util.ts         # JWT helpers
│   │   ├── password.util.ts    # bcrypt helpers
│   │   └── date.util.ts        # Date helpers
│   ├── types/
│   │   ├── express.d.ts        # Express type extensions
│   │   └── api.types.ts        # API-specific types
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   └── integration/
│       ├── auth.test.ts
│       ├── habits.test.ts
│       └── completions.test.ts
├── .env.example
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

### 2. Web App (`apps/web/`)

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx            # Habit calendar
│   │   ├── log/
│   │   │   └── page.tsx        # Log habits
│   │   ├── habits/
│   │   │   └── page.tsx        # Manage habits
│   │   └── settings/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── AppShell/
│   ├── HabitCalendar/
│   ├── HabitCard/
│   └── ...
├── lib/
│   ├── api/                    # Uses @repo/api-client
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useHabits.ts
│   │   └── useCompletions.ts
│   └── utils/
├── public/
├── next.config.ts
├── package.json
└── tsconfig.json
```

### 3. Mobile App (`apps/mobile/`)

```
apps/mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── index.tsx           # Home/Calendar
│   │   ├── log.tsx             # Log habits
│   │   ├── habits.tsx          # Manage habits
│   │   └── settings.tsx
│   └── _layout.tsx
├── components/
│   ├── HabitCard.tsx
│   ├── HabitCalendar.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useHabits.ts
│   └── useCompletions.ts
├── lib/
│   ├── api/                    # Uses @repo/api-client
│   └── storage/                # AsyncStorage utilities
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

### 4. Shared Packages

#### `packages/types/`

```
packages/types/
├── src/
│   ├── index.ts
│   ├── entities/
│   │   ├── user.ts
│   │   ├── habit.ts
│   │   └── completion.ts
│   ├── dto/                    # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   ├── habit.dto.ts
│   │   └── completion.dto.ts
│   └── enums/
│       ├── habit-color.enum.ts
│       └── user-role.enum.ts
├── package.json
└── tsconfig.json
```

#### `packages/api-client/`

```
packages/api-client/
├── src/
│   ├── index.ts
│   ├── client.ts               # API client class
│   ├── endpoints/
│   │   ├── auth.ts
│   │   ├── habits.ts
│   │   ├── completions.ts
│   │   └── users.ts
│   ├── types/
│   │   └── config.ts
│   └── utils/
│       ├── request.ts
│       └── error.ts
├── package.json
└── tsconfig.json
```

#### `packages/core/`

```
packages/core/
├── src/
│   ├── index.ts
│   ├── utils/
│   │   ├── date.ts             # Date utilities (shared)
│   │   ├── streak.ts           # Streak calculation
│   │   └── validation.ts       # Common validation
│   └── constants/
│       ├── colors.ts
│       └── config.ts
├── package.json
└── tsconfig.json
```

### 5. Database (`prisma/`)

```
prisma/
├── schema.prisma               # Database schema
├── migrations/                 # Migration history
│   └── 20260927_initial/
│       └── migration.sql
└── seed.ts                     # Seed data for development
```

---

## Key Files Content

### Root `package.json`

```json
{
  "name": "habit-tracker",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "db:migrate": "cd prisma && prisma migrate dev",
    "db:push": "cd prisma && prisma db push",
    "db:seed": "cd prisma && prisma db seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^6.0.3",
    "prettier": "^3.9.9"
  }
}
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### `apps/api/package.json`

```json
{
  "name": "@habit-tracker/api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "@repo/types": "*",
    "@repo/core": "*",
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0",
    "express-rate-limit": "^7.0.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^26.6.2",
    "tsx": "^4.7.0",
    "typescript": "^6.0.3",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "prisma": "^5.0.0"
  }
}
```

### `apps/api/src/server.ts`

```typescript
import { app } from './app';
import { env } from './config/env';

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Environment: ${env.NODE_ENV}`);
});
```

### `apps/api/src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';

export const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(loggerMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling (must be last)
app.use(errorMiddleware);
```

### `apps/api/src/routes/index.ts`

```typescript
import { Router } from 'express';
import authRoutes from './auth.routes';
import habitsRoutes from './habits.routes';
import completionsRoutes from './completions.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/habits', habitsRoutes);
router.use('/completions', completionsRoutes);
router.use('/users', usersRoutes);

export default router;
```

### `apps/api/src/routes/habits.routes.ts`

```typescript
import { Router } from 'express';
import { HabitsController } from '../controllers/habits.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createHabitSchema, updateHabitSchema } from '../validators/habits.validator';

const router = Router();
const habitsController = new HabitsController();

// All routes require authentication
router.use(authMiddleware);

// GET /api/habits - Get all habits for current user
router.get('/', habitsController.getAll);

// GET /api/habits/:id - Get single habit
router.get('/:id', habitsController.getOne);

// POST /api/habits - Create new habit
router.post('/', validateRequest(createHabitSchema), habitsController.create);

// PATCH /api/habits/:id - Update habit
router.patch('/:id', validateRequest(updateHabitSchema), habitsController.update);

// DELETE /api/habits/:id - Delete habit
router.delete('/:id', habitsController.delete);

export default router;
```

### `apps/api/src/controllers/habits.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { HabitsService } from '../services/habits.service';
import type { CreateHabitDto, UpdateHabitDto } from '@repo/types';

export class HabitsController {
  private habitsService = new HabitsService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id; // Set by auth middleware
      const habits = await this.habitsService.findAll(userId);
      res.json(habits);
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const habitId = req.params.id;
      const habit = await this.habitsService.findOne(habitId, userId);
      res.json(habit);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const dto: CreateHabitDto = req.body;
      const habit = await this.habitsService.create(dto, userId);
      res.status(201).json(habit);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const habitId = req.params.id;
      const dto: UpdateHabitDto = req.body;
      const habit = await this.habitsService.update(habitId, dto, userId);
      res.json(habit);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const habitId = req.params.id;
      await this.habitsService.delete(habitId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
```

### `apps/api/src/services/habits.service.ts`

```typescript
import { HabitsRepository } from '../repositories/habits.repository';
import type { CreateHabitDto, UpdateHabitDto, Habit } from '@repo/types';

export class HabitsService {
  private habitsRepository = new HabitsRepository();

  async findAll(userId: string): Promise<Habit[]> {
    return this.habitsRepository.findAll(userId);
  }

  async findOne(habitId: string, userId: string): Promise<Habit> {
    const habit = await this.habitsRepository.findOne(habitId, userId);
    if (!habit) {
      throw new Error('Habit not found');
    }
    return habit;
  }

  async create(dto: CreateHabitDto, userId: string): Promise<Habit> {
    return this.habitsRepository.create(dto, userId);
  }

  async update(habitId: string, dto: UpdateHabitDto, userId: string): Promise<Habit> {
    const habit = await this.findOne(habitId, userId);
    return this.habitsRepository.update(habitId, dto);
  }

  async delete(habitId: string, userId: string): Promise<void> {
    const habit = await this.findOne(habitId, userId);
    await this.habitsRepository.delete(habitId);
  }
}
```

### `apps/api/src/repositories/habits.repository.ts`

```typescript
import { prisma } from '../config/database';
import type { CreateHabitDto, UpdateHabitDto, Habit } from '@repo/types';

export class HabitsRepository {
  async findAll(userId: string): Promise<Habit[]> {
    return prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(habitId: string, userId: string): Promise<Habit | null> {
    return prisma.habit.findFirst({
      where: { id: habitId, userId },
    });
  }

  async create(dto: CreateHabitDto, userId: string): Promise<Habit> {
    return prisma.habit.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async update(habitId: string, dto: UpdateHabitDto): Promise<Habit> {
    return prisma.habit.update({
      where: { id: habitId },
      data: dto,
    });
  }

  async delete(habitId: string): Promise<void> {
    await prisma.habit.delete({
      where: { id: habitId },
    });
  }
}
```

### `apps/api/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    // Attach user to request
    req.user = payload;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### `packages/types/src/entities/habit.ts`

```typescript
export type HabitColor = 
  | 'red' 
  | 'orange' 
  | 'yellow' 
  | 'green' 
  | 'blue' 
  | 'purple' 
  | 'pink';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  color: HabitColor;
  createdAt: string;
  updatedAt: string;
}

export interface HabitWithCompletions extends Habit {
  completions: Completion[];
}
```

### `packages/types/src/dto/habit.dto.ts`

```typescript
import type { HabitColor } from '../entities/habit';

export interface CreateHabitDto {
  name: string;
  color: HabitColor;
}

export interface UpdateHabitDto {
  name?: string;
  color?: HabitColor;
}
```

### `packages/api-client/src/index.ts`

```typescript
export { ApiClient } from './client';
export * from './endpoints/auth';
export * from './endpoints/habits';
export * from './endpoints/completions';
export * from './endpoints/users';
```

### `packages/api-client/src/client.ts`

```typescript
import { AuthApi } from './endpoints/auth';
import { HabitsApi } from './endpoints/habits';
import { CompletionsApi } from './endpoints/completions';
import { UsersApi } from './endpoints/users';

export interface ApiClientConfig {
  baseURL: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}

export class ApiClient {
  public auth: AuthApi;
  public habits: HabitsApi;
  public completions: CompletionsApi;
  public users: UsersApi;

  constructor(private config: ApiClientConfig) {
    this.auth = new AuthApi(config);
    this.habits = new HabitsApi(config);
    this.completions = new CompletionsApi(config);
    this.users = new UsersApi(config);
  }
}
```

### `packages/api-client/src/endpoints/habits.ts`

```typescript
import type { Habit, CreateHabitDto, UpdateHabitDto } from '@repo/types';
import { request } from '../utils/request';
import type { ApiClientConfig } from '../client';

export class HabitsApi {
  constructor(private config: ApiClientConfig) {}

  async getAll(): Promise<Habit[]> {
    return request<Habit[]>({
      ...this.config,
      method: 'GET',
      url: '/habits',
    });
  }

  async getOne(id: string): Promise<Habit> {
    return request<Habit>({
      ...this.config,
      method: 'GET',
      url: `/habits/${id}`,
    });
  }

  async create(dto: CreateHabitDto): Promise<Habit> {
    return request<Habit>({
      ...this.config,
      method: 'POST',
      url: '/habits',
      data: dto,
    });
  }

  async update(id: string, dto: UpdateHabitDto): Promise<Habit> {
    return request<Habit>({
      ...this.config,
      method: 'PATCH',
      url: `/habits/${id}`,
      data: dto,
    });
  }

  async delete(id: string): Promise<void> {
    return request<void>({
      ...this.config,
      method: 'DELETE',
      url: `/habits/${id}`,
    });
  }
}
```

### `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  habits      Habit[]
  completions Completion[]

  @@map("users")
}

model Habit {
  id        String   @id @default(cuid())
  name      String
  color     String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  completions Completion[]

  @@index([userId])
  @@map("habits")
}

model Completion {
  id          String   @id @default(cuid())
  habitId     String
  userId      String
  completedAt DateTime @db.Date
  createdAt   DateTime @default(now())

  habit Habit @relation(fields: [habitId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([habitId, completedAt])
  @@index([userId])
  @@index([habitId])
  @@map("completions")
}
```

---

## API Endpoints

### Authentication

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/refresh     - Refresh access token
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user
```

### Habits

```
GET    /api/habits           - Get all habits (with completions)
GET    /api/habits/:id       - Get single habit
POST   /api/habits           - Create new habit
PATCH  /api/habits/:id       - Update habit
DELETE /api/habits/:id       - Delete habit
```

### Completions

```
GET    /api/completions      - Get all completions
POST   /api/completions      - Create completion
DELETE /api/completions/:id  - Delete completion
POST   /api/completions/toggle - Toggle completion for habit/date
```

### Users

```
GET    /api/users/me         - Get current user profile
PATCH  /api/users/me         - Update profile
DELETE /api/users/me         - Delete account
```

---

## Environment Variables

### `apps/api/.env`

```bash
# Server
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/habit_tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Push Notifications (optional)
EXPO_ACCESS_TOKEN=your-expo-token
```

### `apps/web/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### `apps/mobile/.env`

```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Development Workflow

### 1. Install Dependencies

```bash
# Root
npm install

# This installs for all workspaces
```

### 2. Setup Database

```bash
# Create database
createdb habit_tracker

# Run migrations
npm run db:migrate

# Seed data (optional)
npm run db:seed
```

### 3. Start Development

```bash
# Start all apps (web + api + mobile)
npm run dev

# Or individually:
cd apps/api && npm run dev      # Port 4000
cd apps/web && npm run dev      # Port 3000
cd apps/mobile && npm start     # Expo
```

### 4. Run Tests

```bash
# All tests
npm run test

# Specific app
cd apps/api && npm run test
```

---

## Deployment

### Backend (Express API)

**Options:**
- Railway: `railway up`
- Render: Connect GitHub repo
- DigitalOcean App Platform
- AWS EC2 / ECS
- Heroku

### Web (Next.js)

- Vercel: `vercel deploy`
- Netlify: Connect GitHub repo
- Cloudflare Pages

### Mobile (React Native)

- iOS: `eas build --platform ios`
- Android: `eas build --platform android`
- Submit: `eas submit`

---

## Benefits of This Architecture

✅ **Code Sharing**: 60-70% code reuse across platforms
✅ **Type Safety**: Shared types ensure consistency
✅ **Scalability**: Independent backend can scale
✅ **Flexibility**: Can add more apps/services easily
✅ **Maintainability**: Clear separation of concerns
✅ **Developer Experience**: Fast development with hot reload
✅ **Testing**: Easy to test each layer independently

---

## Next Steps

1. ✅ Set up monorepo structure
2. ✅ Implement Express backend
3. ✅ Create shared packages
4. ✅ Migrate web app to use API
5. ✅ Build React Native mobile app
6. ✅ Add authentication
7. ✅ Add tests
8. ✅ Deploy to production

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
