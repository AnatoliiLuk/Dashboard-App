# Express Backend - Quick Setup Guide

This guide shows you how to implement the Express backend step-by-step.

---

## Step 1: Initialize Project Structure

```bash
# From your workspace root
mkdir -p apps/api/src/{config,middleware,routes,controllers,services,repositories,validators,utils,types}
mkdir -p apps/api/tests/{unit,integration}
mkdir -p packages/{types,api-client,core}/src
mkdir -p prisma
```

---

## Step 2: Install Backend Dependencies

```bash
cd apps/api

npm init -y

# Core dependencies
npm install express cors helmet dotenv

# Database
npm install @prisma/client
npm install -D prisma

# Authentication
npm install jsonwebtoken bcryptjs

# Validation
npm install zod

# Security & Rate Limiting
npm install express-rate-limit

# Logging
npm install winston

# TypeScript & Development
npm install -D typescript @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/node tsx

# Testing
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

---

## Step 3: TypeScript Configuration

Create `apps/api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node", "jest"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@repo/types": ["../../packages/types/src"],
      "@repo/core": ["../../packages/core/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## Step 4: Environment Configuration

Create `apps/api/.env.example`:

```bash
NODE_ENV=development
PORT=4000

DATABASE_URL=postgresql://user:password@localhost:5432/habit_tracker

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

Create `apps/api/src/config/env.ts`:

```typescript
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().transform((val) => val.split(',')),
});

export const env = envSchema.parse(process.env);
```

---

## Step 5: Database Setup

Create `apps/api/src/config/database.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## Step 6: Middleware

### `apps/api/src/middleware/error.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  console.error('Unexpected error:', error);

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

export const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
};
```

### `apps/api/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './error.middleware';

export interface JwtPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
};
```

### `apps/api/src/middleware/validation.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from './error.middleware';

export const validateRequest = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => err.message).join(', ');
        next(new AppError(400, messages));
      } else {
        next(error);
      }
    }
  };
};
```

### `apps/api/src/middleware/logger.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};
```

---

## Step 7: Utilities

### `apps/api/src/utils/jwt.util.ts`

```typescript
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
```

### `apps/api/src/utils/password.util.ts`

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
```

---

## Step 8: Full Example - Habits Module

### Validator: `apps/api/src/validators/habits.validator.ts`

```typescript
import { z } from 'zod';

const habitColors = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
] as const;

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.enum(habitColors),
});

export const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.enum(habitColors).optional(),
});
```

### Repository: `apps/api/src/repositories/habits.repository.ts`

```typescript
import { prisma } from '../config/database';

export interface CreateHabitInput {
  name: string;
  color: string;
  userId: string;
}

export interface UpdateHabitInput {
  name?: string;
  color?: string;
}

export class HabitsRepository {
  async findAll(userId: string) {
    return prisma.habit.findMany({
      where: { userId },
      include: {
        completions: {
          orderBy: { completedAt: 'desc' },
          take: 30, // Last 30 days
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.habit.findUnique({
      where: { id },
      include: {
        completions: {
          orderBy: { completedAt: 'desc' },
        },
      },
    });
  }

  async create(data: CreateHabitInput) {
    return prisma.habit.create({
      data,
    });
  }

  async update(id: string, data: UpdateHabitInput) {
    return prisma.habit.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.habit.delete({
      where: { id },
    });
  }

  async existsForUser(id: string, userId: string): Promise<boolean> {
    const count = await prisma.habit.count({
      where: { id, userId },
    });
    return count > 0;
  }
}
```

### Service: `apps/api/src/services/habits.service.ts`

```typescript
import { HabitsRepository, CreateHabitInput, UpdateHabitInput } from '../repositories/habits.repository';
import { AppError } from '../middleware/error.middleware';

export class HabitsService {
  private repository = new HabitsRepository();

  async getAll(userId: string) {
    return this.repository.findAll(userId);
  }

  async getOne(id: string, userId: string) {
    const habit = await this.repository.findById(id);

    if (!habit) {
      throw new AppError(404, 'Habit not found');
    }

    if (habit.userId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    return habit;
  }

  async create(name: string, color: string, userId: string) {
    return this.repository.create({ name, color, userId });
  }

  async update(id: string, data: UpdateHabitInput, userId: string) {
    await this.ensureOwnership(id, userId);
    return this.repository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.ensureOwnership(id, userId);
    await this.repository.delete(id);
  }

  private async ensureOwnership(id: string, userId: string) {
    const exists = await this.repository.existsForUser(id, userId);
    if (!exists) {
      throw new AppError(404, 'Habit not found or access denied');
    }
  }
}
```

### Controller: `apps/api/src/controllers/habits.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { HabitsService } from '../services/habits.service';

export class HabitsController {
  private service = new HabitsService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const habits = await this.service.getAll(userId);
      res.json(habits);
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const habit = await this.service.getOne(id, userId);
      res.json(habit);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, color } = req.body;
      const userId = req.user!.id;
      const habit = await this.service.create(name, color, userId);
      res.status(201).json(habit);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const habit = await this.service.update(id, req.body, userId);
      res.json(habit);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      await this.service.delete(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
```

### Routes: `apps/api/src/routes/habits.routes.ts`

```typescript
import { Router } from 'express';
import { HabitsController } from '../controllers/habits.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createHabitSchema, updateHabitSchema } from '../validators/habits.validator';

const router = Router();
const controller = new HabitsController();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', validateRequest(createHabitSchema), controller.create);
router.patch('/:id', validateRequest(updateHabitSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
```

---

## Step 9: Authentication Module

### `apps/api/src/validators/auth.validator.ts`

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
```

### `apps/api/src/services/auth.service.ts`

```typescript
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }
}
```

### `apps/api/src/controllers/auth.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;
      const result = await this.service.register(email, password, name);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const profile = await this.service.getProfile(userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  };
}
```

### `apps/api/src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/register', validateRequest(registerSchema), controller.register);
router.post('/login', validateRequest(loginSchema), controller.login);
router.get('/me', authMiddleware, controller.getProfile);

export default router;
```

---

## Step 10: Main Application Files

### `apps/api/src/routes/index.ts`

```typescript
import { Router } from 'express';
import authRoutes from './auth.routes';
import habitsRoutes from './habits.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/habits', habitsRoutes);

export default router;
```

### `apps/api/src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';

export const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(loggerMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundMiddleware);

// Error handler (must be last)
app.use(errorMiddleware);
```

### `apps/api/src/server.ts`

```typescript
import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/database';

const PORT = env.PORT;

async function start() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Environment: ${env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
```

---

## Step 11: Package.json Scripts

Update `apps/api/package.json`:

```json
{
  "name": "@habit-tracker/api",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "type-check": "tsc --noEmit",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

---

## Step 12: Testing

Create `apps/api/tests/integration/habits.test.ts`:

```typescript
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';

describe('Habits API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Register and login
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    authToken = response.body.token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('POST /api/habits', () => {
    it('should create a new habit', async () => {
      const response = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Morning Exercise',
          color: 'green',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Morning Exercise');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/habits')
        .send({
          name: 'Test Habit',
          color: 'blue',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/habits', () => {
    it('should return all user habits', async () => {
      const response = await request(app)
        .get('/api/habits')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
```

---

## Running Your Backend

```bash
# 1. Start development server
cd apps/api
npm run dev

# 2. In another terminal, test the API
curl http://localhost:4000/health

# 3. Register a user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# 4. Create a habit (use token from registration)
curl -X POST http://localhost:4000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Morning Exercise",
    "color": "green"
  }'

# 5. Get all habits
curl http://localhost:4000/api/habits \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Summary

You now have:

✅ **Complete Express backend** with TypeScript
✅ **Layered architecture** (Routes → Controllers → Services → Repositories)
✅ **Authentication** with JWT
✅ **Validation** with Zod
✅ **Error handling** middleware
✅ **Database access** with Prisma
✅ **Testing setup** with Jest + Supertest
✅ **Type safety** throughout

This backend can serve both your web and mobile apps!
