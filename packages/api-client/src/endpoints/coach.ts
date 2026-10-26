import type { CoachChatDto } from '@repo/types';

import type { ApiCoachConversation, ApiCoachReply } from '../types/api';
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

  getConversation(): Promise<ApiCoachConversation> {
    return request<ApiCoachConversation>({
      ...this.config,
      method: 'GET',
      url: '/coach/conversation',
    });
  }

  deleteConversation(): Promise<void> {
    return request<void>({
      ...this.config,
      method: 'DELETE',
      url: '/coach/conversation',
    });
  }
}
