export { ApiClient, type ApiClientConfig } from './client';
export { ApiError } from './utils/request';
export { AuthApi } from './endpoints/auth';
export { HabitsApi } from './endpoints/habits';
export { CompletionsApi } from './endpoints/completions';
export { GoalsApi } from './endpoints/goals';
export type {
  ApiUser,
  AuthResponse,
  ApiHabit,
  ApiCompletion,
  ApiGoal,
  ToggleCompletionResponse,
} from './types/api';
