import type { CreateCompletionDto } from '@repo/types';

import type { ApiCompletion, ToggleCompletionResponse } from '../types/api';
import type { ApiClientConfig } from '../utils/request';
import { request } from '../utils/request';

export class CompletionsApi {
  constructor(private config: ApiClientConfig) {}

  getAll(): Promise<ApiCompletion[]> {
    return request<ApiCompletion[]>({
      ...this.config,
      method: 'GET',
      url: '/completions',
    });
  }

  toggle(dto: CreateCompletionDto): Promise<ToggleCompletionResponse> {
    return request<ToggleCompletionResponse>({
      ...this.config,
      method: 'POST',
      url: '/completions/toggle',
      data: dto,
    });
  }
}
