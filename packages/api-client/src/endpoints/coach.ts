import type { CoachChatDto } from '@repo/types';

import type { ApiCoachReply } from '../types/api';
import type { ApiClientConfig } from '../utils/request';
import { request } from '../utils/request';

export class CoachApi {
  constructor(private config: ApiClientConfig) {}

  chat(dto: CoachChatDto, signal?: AbortSignal): Promise<ApiCoachReply> {
    return request<ApiCoachReply>({
      ...this.config,
      method: 'POST',
      url: '/coach/chat',
      data: dto,
      signal,
    });
  }
}
