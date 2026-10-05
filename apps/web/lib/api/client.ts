import { ApiClient } from '@repo/api-client';

import { clearToken, getToken } from './token';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
  'http://localhost:4000/api';

export const api = new ApiClient({
  baseURL,
  getToken,
  onUnauthorized: () => {
    clearToken();
  },
});
