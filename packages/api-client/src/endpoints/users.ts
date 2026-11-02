import type {
  ChangePasswordDto,
  DeleteAccountDto,
  UpdateProfileDto,
} from '@repo/types';

import type { ApiUser, ChangePasswordResponse } from '../types/api';
import type { ApiClientConfig } from '../utils/request';
import { request } from '../utils/request';

export class UsersApi {
  constructor(private config: ApiClientConfig) {}

  updateMe(dto: UpdateProfileDto): Promise<ApiUser> {
    return request<ApiUser>({
      ...this.config,
      method: 'PATCH',
      url: '/users/me',
      data: dto,
    });
  }

  /** Signs out other sessions. This one gets a new cookie and token. */
  changePassword(dto: ChangePasswordDto): Promise<ChangePasswordResponse> {
    return request<ChangePasswordResponse>({
      ...this.config,
      method: 'POST',
      url: '/users/me/password',
      data: dto,
    });
  }

  /** The password goes in the body, not the URL, so it stays out of logs. */
  deleteMe(dto: DeleteAccountDto): Promise<void> {
    return request<void>({
      ...this.config,
      method: 'DELETE',
      url: '/users/me',
      data: dto,
    });
  }
}
