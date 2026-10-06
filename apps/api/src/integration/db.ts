import { prisma } from '../config/database';

const testDatabaseName = 'habit_tracker_test';

function assertTestDatabase() {
  const configured = process.env.DATABASE_URL ?? '';
  if (!configured.includes(`/${testDatabaseName}`)) {
    throw new Error(
      `Refusing to reset a database other than ${testDatabaseName}`,
    );
  }
}

export async function resetDatabase() {
  assertTestDatabase();
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "completions", "habits", "users" RESTART IDENTITY CASCADE',
  );
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
