import { Prisma } from '@prisma/client';
import { addDays, compareDates } from '@repo/core';

import { AppError } from '../middleware/error.middleware';
import { CompletionsRepository } from '../repositories/completions.repository';

function toCompletedAt(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export type CompletionsStore = Pick<
  CompletionsRepository,
  | 'findAll'
  | 'findById'
  | 'findByHabitAndDate'
  | 'create'
  | 'delete'
  | 'findHabitForUser'
  | 'habitExistsForUser'
>;

export class CompletionsService {
  constructor(
    private repository: CompletionsStore = new CompletionsRepository(),
    private now: () => Date = () => new Date(),
  ) {}

  async getAll(userId: string) {
    return this.repository.findAll(userId);
  }

  async create(habitId: string, date: string, userId: string) {
    await this.ensureLoggable(habitId, date, userId);

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

  // Idempotent undo for one day: false when there was nothing to remove.
  async removeForDate(
    habitId: string,
    date: string,
    userId: string,
  ): Promise<boolean> {
    await this.ensureHabitOwnership(habitId, userId);

    const existing = await this.repository.findByHabitAndDate(
      habitId,
      userId,
      toCompletedAt(date),
    );
    if (!existing) {
      return false;
    }

    await this.repository.delete(existing.id);
    return true;
  }

  // Undoing is always allowed; only adding a day is checked.
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

    await this.ensureLoggable(habitId, date, userId);
    const completion = await this.repository.create({
      habitId,
      userId,
      completedAt,
    });

    return { completed: true as const, completion };
  }

  // The server has no user timezone: "today" may be one day ahead of UTC.
  // Days before the habit's UTC creation date never count (same as web).
  private async ensureLoggable(habitId: string, date: string, userId: string) {
    const habit = await this.repository.findHabitForUser(habitId, userId);
    if (!habit) {
      throw new AppError(404, 'Habit not found');
    }
    if (habit.archivedAt) {
      throw new AppError(409, 'Habit is archived');
    }
    if (compareDates(date, addDays(toIsoDate(this.now()), 1)) > 0) {
      throw new AppError(400, 'Cannot log a future date');
    }
    const createdOn = toIsoDate(habit.createdAt);
    if (compareDates(date, createdOn) < 0) {
      throw new AppError(
        400,
        `Habit was created on ${createdOn}; earlier days cannot be logged`,
      );
    }
  }

  private async ensureHabitOwnership(habitId: string, userId: string) {
    const exists = await this.repository.habitExistsForUser(habitId, userId);
    if (!exists) {
      throw new AppError(404, 'Habit not found');
    }
  }
}
