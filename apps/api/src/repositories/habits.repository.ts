import type { HabitColor } from '@prisma/client';

import { prisma } from '../config/database';
import { archivedAtFor } from '../utils/archive.util';

export type CreateHabitInput = {
  name: string;
  color: HabitColor;
  userId: string;
};

export type UpdateHabitInput = {
  name?: string;
  color?: HabitColor;
  archived?: boolean;
};

export class HabitsRepository {
  async findAll(userId: string) {
    return prisma.habit.findMany({
      where: { userId },
      include: {
        completions: {
          orderBy: { completedAt: 'desc' },
          take: 30,
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

  async update(id: string, { archived, ...data }: UpdateHabitInput) {
    return prisma.habit.update({
      where: { id },
      data: {
        ...data,
        archivedAt: archivedAtFor(archived),
      },
    });
  }

  async isArchived(id: string): Promise<boolean> {
    const habit = await prisma.habit.findUnique({
      where: { id },
      select: { archivedAt: true },
    });
    return Boolean(habit?.archivedAt);
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
