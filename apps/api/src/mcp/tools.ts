import type { HabitColor } from '@prisma/client';
import { compareDates, streakFor } from '@repo/core';
import type { OAuthScope } from '@repo/types';

import {
  summarizeGoals,
  summarizeHabits,
  summarizeHistory,
  toCompletion,
  toHabit,
  type HabitWithCompletionsRow,
} from '../ai/coach.data';
import { AppError } from '../middleware/error.middleware';
import type { CompletionsService } from '../services/completions.service';
import type { GoalsService } from '../services/goals.service';
import type { HabitsService } from '../services/habits.service';

// Slices of the existing services, so ownership checks and validation stay in
// one place. MCP can log and create, but never deletes or archives.
export interface McpServices {
  habits: Pick<HabitsService, 'getAll' | 'getOne' | 'create'>;
  completions: Pick<CompletionsService, 'getAll' | 'create' | 'removeForDate'>;
  goals: Pick<GoalsService, 'getAll'>;
}

export interface McpContext {
  // Always from the token, never from tool input.
  userId: string;
  // A function: a stdio server can run past midnight.
  today: () => string;
  // Granted OAuth scopes; every scope when omitted (personal token).
  scopes?: readonly OAuthScope[];
}

export class McpTools {
  constructor(
    private services: McpServices,
    private context: McpContext,
  ) {}

  async listHabits() {
    const { userId } = this.context;
    const today = this.context.today();
    const [habits, completions] = await Promise.all([
      this.services.habits.getAll(userId),
      this.services.completions.getAll(userId),
    ]);
    return { today, ...summarizeHabits(habits, completions, today) };
  }

  async habitHistory({ habitId, days }: { habitId: string; days: number }) {
    // getOne checks ownership: another user's habit is "not found".
    const habit = await this.services.habits.getOne(
      habitId,
      this.context.userId,
    );
    return summarizeHistory(habit, days, this.context.today());
  }

  async listGoals() {
    const { userId } = this.context;
    const today = this.context.today();
    const [goals, habits, completions] = await Promise.all([
      this.services.goals.getAll(userId),
      this.services.habits.getAll(userId),
      this.services.completions.getAll(userId),
    ]);
    return { today, ...summarizeGoals(goals, habits, completions, today) };
  }

  async todayChecklist() {
    const { userId } = this.context;
    const today = this.context.today();
    const [habits, completions] = await Promise.all([
      this.services.habits.getAll(userId),
      this.services.completions.getAll(userId),
    ]);
    const done = new Set(
      completions
        .map(toCompletion)
        .filter((completion) => completion.date === today)
        .map((completion) => completion.habitId),
    );

    return {
      date: today,
      habits: habits
        .filter((habit) => !habit.archivedAt)
        .map((habit) => ({
          id: habit.id,
          name: habit.name,
          done: done.has(habit.id),
        })),
    };
  }

  async logHabit({ habitId, date }: { habitId: string; date?: string }) {
    const today = this.context.today();
    const day = date ?? today;
    const habit = await this.loggableHabit(habitId, day, today);

    let status: 'logged' | 'already_logged' = 'logged';
    try {
      await this.services.completions.create(
        habit.id,
        day,
        this.context.userId,
      );
    } catch (error) {
      if (!(error instanceof AppError && error.statusCode === 409)) {
        throw error;
      }
      status = 'already_logged';
    }

    const dates = new Set(
      habit.completions.map((row) => toCompletion(row).date),
    );
    dates.add(day);
    const streak = streakFor(
      toHabit(habit),
      [...dates].map((completed) => ({
        id: completed,
        habitId: habit.id,
        ownerId: habit.userId,
        date: completed,
      })),
      today,
    );

    return {
      status,
      habit: { id: habit.id, name: habit.name },
      date: day,
      currentStreak: streak.current,
      bestStreak: streak.best,
    };
  }

  async unlogHabit({ habitId, date }: { habitId: string; date?: string }) {
    const day = date ?? this.context.today();
    const habit = await this.services.habits.getOne(
      habitId,
      this.context.userId,
    );
    const removed = await this.services.completions.removeForDate(
      habit.id,
      day,
      this.context.userId,
    );

    return {
      status: removed ? 'removed' : 'not_logged',
      habit: { id: habit.id, name: habit.name },
      date: day,
    };
  }

  async createHabit({ name, color }: { name: string; color: HabitColor }) {
    const habit = await this.services.habits.create(
      name,
      color,
      this.context.userId,
    );
    return {
      status: 'created',
      habit: {
        id: habit.id,
        name: habit.name,
        color: habit.color,
        createdOn: toHabit(habit).createdOn,
      },
    };
  }

  // Same rules as the web log: no archived habits, no future days, and no
  // days before the habit existed (they never count towards streaks).
  private async loggableHabit(
    habitId: string,
    day: string,
    today: string,
  ): Promise<HabitWithCompletionsRow> {
    const habit = await this.services.habits.getOne(
      habitId,
      this.context.userId,
    );

    if (habit.archivedAt) {
      throw new AppError(409, 'Habit is archived');
    }
    if (compareDates(day, today) > 0) {
      throw new AppError(400, `Cannot log a future date (today is ${today})`);
    }
    const createdOn = toHabit(habit).createdOn;
    if (compareDates(day, createdOn) < 0) {
      throw new AppError(
        400,
        `Habit was created on ${createdOn}; earlier days cannot be logged`,
      );
    }

    return habit;
  }
}
