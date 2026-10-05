import type { ApiCompletion, ApiHabit } from '@repo/api-client';
import type { Completion, Habit } from '@repo/types';

/** Map API (Prisma) fields to shared web entity shapes. */
export function toHabit(habit: ApiHabit): Habit {
  return {
    id: habit.id,
    ownerId: habit.userId,
    name: habit.name,
    color: habit.color,
    createdOn: habit.createdAt.slice(0, 10),
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
