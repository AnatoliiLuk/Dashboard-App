import { Prisma } from '@prisma/client';

import { AppError } from '../middleware/error.middleware';
import {
  GoalsRepository,
  type CreateGoalInput,
  type GoalRecord,
  type UpdateGoalInput,
} from '../repositories/goals.repository';

export class GoalsService {
  private repository = new GoalsRepository();

  async getAll(userId: string): Promise<GoalRecord[]> {
    return this.repository.findAll(userId);
  }

  async create(
    input: Omit<CreateGoalInput, 'userId'>,
    userId: string,
  ): Promise<GoalRecord> {
    await this.ensureHabitsOwned(input.habitIds, userId);
    return this.write(() => this.repository.create({ ...input, userId }));
  }

  async update(
    id: string,
    input: UpdateGoalInput,
    userId: string,
  ): Promise<GoalRecord> {
    const goal = await this.getOwnedGoal(id, userId);
    const startDate = input.startDate ?? goal.startDate;
    const endDate = input.endDate ?? goal.endDate;

    if (startDate > endDate) {
      throw new AppError(400, 'Start date must be on or before end date');
    }

    if (input.habitIds) {
      await this.ensureHabitsOwned(input.habitIds, userId);
    }

    return this.write(() => this.repository.update(id, input));
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getOwnedGoal(id, userId);
    await this.repository.delete(id);
  }

  private async getOwnedGoal(id: string, userId: string): Promise<GoalRecord> {
    const goal = await this.repository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new AppError(404, 'Goal not found');
    }

    return goal;
  }

  private async ensureHabitsOwned(
    habitIds: string[],
    userId: string,
  ): Promise<void> {
    const owned = await this.repository.countOwnedHabits(habitIds, userId);

    if (owned !== habitIds.length) {
      throw new AppError(404, 'Habit not found');
    }
  }

  private async write(action: () => Promise<GoalRecord>): Promise<GoalRecord> {
    try {
      return await action();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new AppError(404, 'Habit not found');
      }

      throw error;
    }
  }
}
