import { PrismaClient, HabitColor } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@habits.plus';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Seed skipped: demo user already exists');
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: 'Demo',
      // bcrypt hash for "password" — replace in production seeds
      passwordHash:
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      habits: {
        create: [
          {
            name: 'Stretch',
            color: HabitColor.sky,
          },
          {
            name: 'Read',
            color: HabitColor.violet,
          },
        ],
      },
    },
    include: { habits: true },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.completion.create({
    data: {
      habitId: user.habits[0].id,
      userId: user.id,
      completedAt: today,
    },
  });

  console.log(
    `Seeded demo user ${user.email} with ${user.habits.length} habits`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
