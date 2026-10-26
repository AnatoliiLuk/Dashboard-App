export { ApiClient, type ApiClientConfig } from './client';
export { ApiError } from './utils/request';
export { AuthApi } from './endpoints/auth';
export { HabitsApi } from './endpoints/habits';
export { CompletionsApi } from './endpoints/completions';
export { GoalsApi } from './endpoints/goals';
export { CoachApi } from './endpoints/coach';
export type {
  ApiUser,
  AuthResponse,
  ApiHabit,
  ApiCompletion,
  ApiGoal,
  ToggleCompletionResponse,
  ApiCoachReply,
  ApiHabitProposal,
} from './types/api';
