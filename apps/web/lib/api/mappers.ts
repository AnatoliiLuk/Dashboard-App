import type { ApiCompletion, ApiGoal, ApiHabit } from '@repo/api-client';
import type { Completion, Goal, Habit } from '@repo/types';

/** Map API (Prisma) fields to shared web entity shapes. */
export function toHabit(habit: ApiHabit): Habit {
  return {
    id: habit.id,
    ownerId: habit.userId,
    name: habit.name,
    color: habit.color,
    createdOn: habit.createdAt.slice(0, 10),
    archivedAt: habit.archivedAt ?? null,
  };
}

export function toGoal(goal: ApiGoal): Goal {
  return {
    id: goal.id,
    ownerId: goal.userId,
    name: goal.name,
    color: goal.color,
    startDate: goal.startDate.slice(0, 10),
    endDate: goal.endDate.slice(0, 10),
    habitIds: goal.habitIds,
    archivedAt: goal.archivedAt ?? null,
  };
}

export function toCompletion(completion: ApiCompletion): Completion {
  return {
    id: completion.id,
    habitId: completion.habitId,
    ownerId: completion.userId,
    date: completion.completedAt.slice(0, 10),
  };
}
