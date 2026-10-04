import type { CreateHabitDto, UpdateHabitDto } from '@repo/types';

import type { ApiHabit } from '../types/api';
import type { ApiClientConfig } from '../utils/request';
import { request } from '../utils/request';

export class HabitsApi {
  constructor(private config: ApiClientConfig) {}

  getAll(): Promise<ApiHabit[]> {
    return request<ApiHabit[]>({
      ...this.config,
      method: 'GET',
      url: '/habits',
    });
  }

  getOne(id: string): Promise<ApiHabit> {
    return request<ApiHabit>({
      ...this.config,
      method: 'GET',
      url: `/habits/${id}`,
    });
  }

  create(dto: CreateHabitDto): Promise<ApiHabit> {
    return request<ApiHabit>({
      ...this.config,
      method: 'POST',
      url: '/habits',
      data: dto,
    });
  }

  update(id: string, dto: UpdateHabitDto): Promise<ApiHabit> {
    return request<ApiHabit>({
      ...this.config,
      method: 'PATCH',
      url: `/habits/${id}`,
      data: dto,
    });
  }

  delete(id: string): Promise<void> {
    return request<void>({
      ...this.config,
      method: 'DELETE',
      url: `/habits/${id}`,
    });
  }
}
