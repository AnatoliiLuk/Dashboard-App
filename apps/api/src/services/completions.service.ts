import { Prisma } from '@prisma/client';

import { AppError } from '../middleware/error.middleware';
import { CompletionsRepository } from '../repositories/completions.repository';

function toCompletedAt(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export class CompletionsService {
  private repository = new CompletionsRepository();

  async getAll(userId: string) {
    return this.repository.findAll(userId);
  }

  async create(habitId: string, date: string, userId: string) {
    await this.ensureHabitOwnership(habitId, userId);

    const completedAt = toCompletedAt(date);

    try {
      return await this.repository.create({
        habitId,
        userId,
        completedAt,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError(409, 'Completion already exists for this date');
      }
      throw error;
    }
  }

  async delete(id: string, userId: string) {
    const completion = await this.repository.findById(id);

    if (!completion || completion.userId !== userId) {
      throw new AppError(404, 'Completion not found');
    }

    await this.repository.delete(id);
  }

  async toggle(habitId: string, date: string, userId: string) {
    await this.ensureHabitOwnership(habitId, userId);

    const completedAt = toCompletedAt(date);
    const existing = await this.repository.findByHabitAndDate(
      habitId,
      userId,
      completedAt,
    );

    if (existing) {
      await this.repository.delete(existing.id);
      return { completed: false as const, completion: null };
    }

    const completion = await this.repository.create({
      habitId,
      userId,
      completedAt,
    });

    return { completed: true as const, completion };
  }

  private async ensureHabitOwnership(habitId: string, userId: string) {
    const exists = await this.repository.habitExistsForUser(habitId, userId);
    if (!exists) {
      throw new AppError(404, 'Habit not found');
    }
  }
}
