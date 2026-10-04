import type { HabitColor } from '@repo/types';

/** Shapes returned by the Express API (Prisma JSON), not the web localStorage entities. */

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
};

export type AuthResponse = {
  user: ApiUser;
  token: string;
};

export type ApiCompletion = {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  createdAt: string;
};

export type ApiHabit = {
  id: string;
  name: string;
  color: HabitColor;
  userId: string;
  createdAt: string;
  updatedAt: string;
  completions?: ApiCompletion[];
};

export type ToggleCompletionResponse = {
  completed: boolean;
  completion: ApiCompletion | null;
};
