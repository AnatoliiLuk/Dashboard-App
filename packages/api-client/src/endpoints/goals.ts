import type { CreateGoalDto, UpdateGoalDto } from '@repo/types';

import type { ApiGoal } from '../types/api';
import type { ApiClientConfig } from '../utils/request';
import { request } from '../utils/request';

export class GoalsApi {
  constructor(private config: ApiClientConfig) {}

  getAll(): Promise<ApiGoal[]> {
    return request<ApiGoal[]>({
      ...this.config,
      method: 'GET',
      url: '/goals',
    });
  }

  create(dto: CreateGoalDto): Promise<ApiGoal> {
    return request<ApiGoal>({
      ...this.config,
      method: 'POST',
      url: '/goals',
      data: dto,
    });
  }

  update(id: string, dto: UpdateGoalDto): Promise<ApiGoal> {
    return request<ApiGoal>({
      ...this.config,
      method: 'PATCH',
      url: `/goals/${id}`,
      data: dto,
    });
  }

  delete(id: string): Promise<void> {
    return request<void>({
      ...this.config,
      method: 'DELETE',
      url: `/goals/${id}`,
    });
  }
}
