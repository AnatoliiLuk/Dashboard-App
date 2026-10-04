import type { LoginDto, RegisterDto } from '@repo/types';

import type { ApiClientConfig } from '../utils/request';
import { request } from '../utils/request';
import type { ApiUser, AuthResponse } from '../types/api';

export class AuthApi {
  constructor(private config: ApiClientConfig) {}

  register(dto: RegisterDto): Promise<AuthResponse> {
    return request<AuthResponse>({
      ...this.config,
      method: 'POST',
      url: '/auth/register',
      data: dto,
      auth: false,
    });
  }

  login(dto: LoginDto): Promise<AuthResponse> {
    return request<AuthResponse>({
      ...this.config,
      method: 'POST',
      url: '/auth/login',
      data: dto,
      auth: false,
    });
  }

  me(): Promise<ApiUser> {
    return request<ApiUser>({
      ...this.config,
      method: 'GET',
      url: '/auth/me',
    });
  }
}
