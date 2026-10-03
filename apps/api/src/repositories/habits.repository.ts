import type { HabitColor } from '@prisma/client';

import { prisma } from '../config/database';

export type CreateHabitInput = {
  name: string;
  color: HabitColor;
  userId: string;
};

export type UpdateHabitInput = {
  name?: string;
  color?: HabitColor;
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
