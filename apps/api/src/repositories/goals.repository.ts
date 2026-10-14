import { Prisma, type GoalColor } from '@prisma/client';

import { prisma } from '../config/database';

const withHabitIds = {
  habits: {
    select: { habitId: true },
    orderBy: { habitId: 'asc' },
  },
} as const;

type GoalWithHabits = Prisma.GoalGetPayload<{ include: typeof withHabitIds }>;

export type GoalRecord = {
  id: string;
  name: string;
  color: GoalColor;
  startDate: string;
  endDate: string;
  userId: string;
  habitIds: string[];
};

export type CreateGoalInput = {
  name: string;
  color: GoalColor;
  startDate: string;
  endDate: string;
  userId: string;
  habitIds: string[];
};

export type UpdateGoalInput = {
  name?: string;
  color?: GoalColor;
  startDate?: string;
  endDate?: string;
  habitIds?: string[];
};

export class GoalsRepository {
  async findAll(userId: string): Promise<GoalRecord[]> {
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: withHabitIds,
      orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
    });

    return goals.map(toGoalRecord);
  }

  async findById(id: string): Promise<GoalRecord | null> {
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: withHabitIds,
    });

    return goal ? toGoalRecord(goal) : null;
  }

  async create(data: CreateGoalInput): Promise<GoalRecord> {
    const goal = await prisma.goal.create({
      data: {
        name: data.name,
        color: data.color,
        startDate: toUtcDate(data.startDate),
        endDate: toUtcDate(data.endDate),
        userId: data.userId,
        habits: {
          create: data.habitIds.map((habitId) => ({ habitId })),
        },
      },
      include: withHabitIds,
    });

    return toGoalRecord(goal);
  }

  async update(id: string, data: UpdateGoalInput): Promise<GoalRecord> {
    const goal = await prisma.$transaction(async (tx) => {
      if (data.habitIds) {
        await tx.goalHabit.deleteMany({ where: { goalId: id } });
        await tx.goalHabit.createMany({
          data: data.habitIds.map((habitId) => ({ goalId: id, habitId })),
        });
      }

      return tx.goal.update({
        where: { id },
        data: {
          name: data.name,
          color: data.color,
          startDate: data.startDate ? toUtcDate(data.startDate) : undefined,
          endDate: data.endDate ? toUtcDate(data.endDate) : undefined,
        },
        include: withHabitIds,
      });
    });

    return toGoalRecord(goal);
  }

  async delete(id: string): Promise<void> {
    await prisma.goal.delete({ where: { id } });
  }

  async countOwnedHabits(habitIds: string[], userId: string): Promise<number> {
    return prisma.habit.count({
      where: { userId, id: { in: habitIds } },
    });
  }
}

function toGoalRecord(goal: GoalWithHabits): GoalRecord {
  return {
    id: goal.id,
    name: goal.name,
    color: goal.color,
    startDate: toDateString(goal.startDate),
    endDate: toDateString(goal.endDate),
    userId: goal.userId,
    habitIds: goal.habits.map((link) => link.habitId),
  };
}

function toUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}
