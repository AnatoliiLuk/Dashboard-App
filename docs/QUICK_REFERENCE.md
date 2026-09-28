# Quick Reference Card

One-page reference for the Express + Monorepo architecture.

---

## 📁 Project Structure

```
habit-tracker/
├── apps/
│   ├── web/          # Next.js → Port 3000
│   ├── mobile/       # React Native → Expo
│   └── api/          # Express → Port 4000
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── api-client/   # API wrapper
│   └── core/         # Utilities
└── prisma/           # Database schema
```

---

## 🔧 Essential Commands

```bash
# Development
npm run dev              # Start all apps
cd apps/api && npm run dev       # Backend only
cd apps/web && npm run dev       # Web only
cd apps/mobile && npm start      # Mobile only

# Database
npx prisma migrate dev   # Run migrations
npx prisma generate      # Generate client
npx prisma studio        # Open DB GUI

# Build & Test
npm run build            # Build all
npm run test             # Test all
npm run type-check       # Check types

# Prisma
npx prisma db push       # Push schema (dev)
npx prisma db seed       # Seed data
```

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/register    { email, password, name? }
POST   /api/auth/login       { email, password }
GET    /api/auth/me          Headers: { Authorization: Bearer <token> }
```

### Habits
```
GET    /api/habits           → Habit[]
POST   /api/habits           { name, color }
GET    /api/habits/:id       → Habit
PATCH  /api/habits/:id       { name?, color? }
DELETE /api/habits/:id       → 204
```

### Completions
```
GET    /api/completions                    → Completion[]
POST   /api/completions                    { habitId, date }
DELETE /api/completions/:id                → 204
POST   /api/completions/toggle             { habitId, date }
```

---

## 🔐 Authentication

### Client (Web/Mobile)
```typescript
// 1. Register/Login
const response = await apiClient.auth.login(email, password);
const { token, user } = response;

// 2. Store token
localStorage.setItem('token', token);  // Web
AsyncStorage.setItem('token', token);  // Mobile

// 3. Use in requests
headers: { 'Authorization': `Bearer ${token}` }
```

### Backend Middleware
```typescript
// Protects routes
router.use(authMiddleware);

// Attaches user to request
req.user = { id: "...", email: "..." }
```

---

## 📦 Import Patterns

### Shared Types
```typescript
// Anywhere
import { Habit, Completion, CreateHabitDto } from '@repo/types';
```

### API Client
```typescript
// Web/Mobile
import { ApiClient } from '@repo/api-client';

const api = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  getToken: () => localStorage.getItem('token'),
});

const habits = await api.habits.getAll();
```

### Backend
```typescript
// Services/Controllers
import { prisma } from '@/config/database';
import { AppError } from '@/middleware/error.middleware';
import { generateToken } from '@/utils/jwt.util';
```

---

## 🏗️ Backend Layer Pattern

```typescript
// 1. Route
router.post('/habits', 
  authMiddleware,           // Verify JWT
  validateRequest(schema),  // Validate body
  controller.create         // Handle request
);

// 2. Controller (HTTP handling)
async create(req: Request, res: Response) {
  const { name, color } = req.body;
  const habit = await service.create(name, color, req.user!.id);
  res.status(201).json(habit);
}

// 3. Service (Business logic)
async create(name: string, color: string, userId: string) {
  // Business rules here
  return repository.create({ name, color, userId });
}

// 4. Repository (Database)
async create(data: CreateHabitInput) {
  return prisma.habit.create({ data });
}
```

---

## 🗄️ Prisma Quick Reference

```typescript
// Find all
const habits = await prisma.habit.findMany({
  where: { userId },
  include: { completions: true },
  orderBy: { createdAt: 'asc' },
});

// Find one
const habit = await prisma.habit.findUnique({
  where: { id },
});

// Create
const habit = await prisma.habit.create({
  data: { name, color, userId },
});

// Update
const habit = await prisma.habit.update({
  where: { id },
  data: { name, color },
});

// Delete
await prisma.habit.delete({
  where: { id },
});

// Count
const count = await prisma.habit.count({
  where: { userId },
});
```

---

## 🔑 Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/habit_tracker
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Web (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Mobile (.env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🚨 Error Handling

### Backend
```typescript
// Throw operational error
throw new AppError(404, 'Habit not found');
throw new AppError(400, 'Invalid input');
throw new AppError(401, 'Unauthorized');

// Caught by errorMiddleware
export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }
  // Log and return 500 for unexpected errors
};
```

### Frontend
```typescript
try {
  const habit = await api.habits.create(data);
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
  } else {
    // Show error message
    alert(error.message);
  }
}
```

---

## 🧪 Testing

### Backend Integration Test
```typescript
describe('Habits API', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'pass123' });
    token = res.body.token;
  });

  it('should create habit', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Exercise', color: 'green' });
    
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Exercise');
  });
});
```

---

## 🔍 Debugging

### Backend
```typescript
// Add console logs
console.log('User:', req.user);
console.log('Body:', req.body);
console.log('Params:', req.params);

// Use debugger
debugger;

// Check Prisma queries
// In config/database.ts
new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Check API
```bash
# Health check
curl http://localhost:4000/health

# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Get habits (with token)
curl http://localhost:4000/api/habits \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Common Patterns

### React Query (Web/Mobile)
```typescript
// Fetch
const { data: habits, isLoading } = useQuery({
  queryKey: ['habits'],
  queryFn: () => api.habits.getAll(),
});

// Mutate
const createMutation = useMutation({
  mutationFn: (data) => api.habits.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['habits'] });
  },
});

// Use
createMutation.mutate({ name: 'Exercise', color: 'green' });
```

### Optimistic Updates
```typescript
const toggleMutation = useMutation({
  mutationFn: ({ habitId, date }) => 
    api.completions.toggle(habitId, date),
  
  onMutate: async ({ habitId }) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({ queryKey: ['habits'] });
    
    // Snapshot current state
    const previous = queryClient.getQueryData(['habits']);
    
    // Optimistically update
    queryClient.setQueryData(['habits'], (old) =>
      updateHabitCompletion(old, habitId)
    );
    
    return { previous };
  },
  
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['habits'], context.previous);
  },
});
```

---

## 🚀 Deployment URLs

### Development
- Web: http://localhost:3000
- API: http://localhost:4000
- Mobile: Expo app

### Production
- Web: https://yourapp.vercel.app
- API: https://api.yourapp.com
- Mobile: iOS App Store / Google Play

---

## 📚 File Shortcuts

```bash
# Backend
apps/api/src/app.ts                 # Express setup
apps/api/src/routes/habits.routes.ts # Habit routes
apps/api/src/middleware/auth.middleware.ts # JWT auth

# Frontend
apps/web/lib/hooks/useHabits.ts     # Habit hook
apps/web/app/page.tsx                # Home page

# Shared
packages/types/src/entities/habit.ts # Habit type
packages/api-client/src/endpoints/habits.ts # API client

# Database
prisma/schema.prisma                 # DB schema
```

---

## 💡 Pro Tips

1. **Always type-check**: `npm run type-check`
2. **Use Prisma Studio**: `npx prisma studio` for DB GUI
3. **Test with Postman**: Import API endpoints
4. **Watch logs**: Keep terminal visible when debugging
5. **Commit often**: Small, focused commits
6. **Read errors carefully**: Error messages are helpful
7. **Use console.log**: Don't be afraid to debug
8. **Restart server**: After env changes

---

## 🆘 Common Issues

### Port already in use
```bash
# Find process
lsof -i :4000
# Kill it
kill -9 <PID>
```

### Prisma client not generated
```bash
npx prisma generate
```

### Type errors after changes
```bash
# Rebuild shared packages
npm run build
```

### JWT token invalid
- Check JWT_SECRET matches
- Token might be expired
- Generate new token

### Database connection error
- Check DATABASE_URL
- Ensure PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

---

## 📖 Learn More

- Full docs: `docs/README.md`
- Checklist: `docs/QUICK_START_CHECKLIST.md`
- Backend guide: `docs/EXPRESS_BACKEND_SETUP.md`
- Architecture: `docs/ARCHITECTURE.md`
- Diagrams: `docs/ARCHITECTURE_DIAGRAM.md`

---

**Keep this open while coding!** 🚀
