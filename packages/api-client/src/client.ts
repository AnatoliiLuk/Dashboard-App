import { AuthApi } from './endpoints/auth';
import { CompletionsApi } from './endpoints/completions';
import { HabitsApi } from './endpoints/habits';
import type { ApiClientConfig } from './utils/request';

export type { ApiClientConfig };

export class ApiClient {
  public auth: AuthApi;
  public habits: HabitsApi;
  public completions: CompletionsApi;

  constructor(config: ApiClientConfig) {
    this.auth = new AuthApi(config);
    this.habits = new HabitsApi(config);
    this.completions = new CompletionsApi(config);
  }
}
