import type { HabitColor } from '@prisma/client';

import { AppError } from '../middleware/error.middleware';
import {
  HabitsRepository,
  type UpdateHabitInput,
} from '../repositories/habits.repository';

export class HabitsService {
  private repository = new HabitsRepository();

  async getAll(userId: string) {
    return this.repository.findAll(userId);
  }

  async getOne(id: string, userId: string) {
    const habit = await this.repository.findById(id);

    if (!habit || habit.userId !== userId) {
      throw new AppError(404, 'Habit not found');
    }

    return habit;
  }

  async create(name: string, color: HabitColor, userId: string) {
    return this.repository.create({ name, color, userId });
  }

  async update(id: string, data: UpdateHabitInput, userId: string) {
    await this.ensureOwnership(id, userId);
    return this.repository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.ensureOwnership(id, userId);
    await this.repository.delete(id);
  }

  private async ensureOwnership(id: string, userId: string) {
    const exists = await this.repository.existsForUser(id, userId);
    if (!exists) {
      throw new AppError(404, 'Habit not found');
    }
  }
}
