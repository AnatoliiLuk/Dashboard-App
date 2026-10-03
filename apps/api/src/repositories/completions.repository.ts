import { prisma } from '../config/database';

export type CreateCompletionInput = {
  habitId: string;
  userId: string;
  completedAt: Date;
};

export class CompletionsRepository {
  async findAll(userId: string) {
    return prisma.completion.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.completion.findUnique({
      where: { id },
    });
  }

  async findByHabitAndDate(habitId: string, userId: string, completedAt: Date) {
    return prisma.completion.findFirst({
      where: { habitId, userId, completedAt },
    });
  }

  async create(data: CreateCompletionInput) {
    return prisma.completion.create({
      data,
    });
  }

  async delete(id: string) {
    return prisma.completion.delete({
      where: { id },
    });
  }

  async habitExistsForUser(habitId: string, userId: string): Promise<boolean> {
    const count = await prisma.habit.count({
      where: { id: habitId, userId },
    });
    return count > 0;
  }
}
