import { AuthApi } from './endpoints/auth';
import { CoachApi } from './endpoints/coach';
import { CompletionsApi } from './endpoints/completions';
import { GoalsApi } from './endpoints/goals';
import { HabitsApi } from './endpoints/habits';
import { UsersApi } from './endpoints/users';
import type { ApiClientConfig } from './utils/request';

export type { ApiClientConfig };

export class ApiClient {
  public auth: AuthApi;
  public habits: HabitsApi;
  public completions: CompletionsApi;
  public goals: GoalsApi;
  public coach: CoachApi;
  public users: UsersApi;

  constructor(config: ApiClientConfig) {
    this.auth = new AuthApi(config);
    this.habits = new HabitsApi(config);
    this.completions = new CompletionsApi(config);
    this.goals = new GoalsApi(config);
    this.coach = new CoachApi(config);
    this.users = new UsersApi(config);
  }
}
