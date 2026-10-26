import type { GoalColor, HabitColor } from '@repo/types';

/** Shapes returned by the Express API. */

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
};

export type AuthResponse = {
  user: ApiUser;
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
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  completions?: ApiCompletion[];
};

export type ApiGoal = {
  id: string;
  name: string;
  color: GoalColor;
  startDate: string;
  endDate: string;
  userId: string;
  habitIds: string[];
  archivedAt: string | null;
};

export type ToggleCompletionResponse = {
  completed: boolean;
  completion: ApiCompletion | null;
};

/** A habit the coach suggests. Nothing is saved until the person accepts. */
export type ApiHabitProposal = {
  name: string;
  color: HabitColor;
  reason: string;
};

export type ApiCoachReply = {
  reply: string;
  /** The reply hit the length limit and was cut off. */
  truncated: boolean;
  proposal: ApiHabitProposal | null;
};

/** One saved message. Assistant messages keep their note and proposal. */
export type ApiCoachMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  truncated: boolean;
  proposal: ApiHabitProposal | null;
};

/** The person's one ongoing conversation, oldest message first. */
export type ApiCoachConversation = {
  messages: ApiCoachMessage[];
  /** Days without a new message before the server deletes it. */
  retentionDays: number;
};
