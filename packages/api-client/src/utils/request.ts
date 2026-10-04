export type ApiClientConfig = {
  /** e.g. http://localhost:4000/api */
  baseURL: string;
  getToken?: () => string | null | undefined;
  onUnauthorized?: () => void;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = ApiClientConfig & {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  url: string;
  data?: unknown;
  /** When false, do not attach Authorization (login/register). Default true. */
  auth?: boolean;
};

export async function request<T>(options: RequestOptions): Promise<T> {
  const {
    baseURL,
    getToken,
    onUnauthorized,
    method,
    url,
    data,
    auth = true,
  } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (data !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${baseURL.replace(/\/$/, '')}${url}`, {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  if (response.status === 401) {
    onUnauthorized?.();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? ((await response.json()) as unknown)
    : await response.text();

  if (!response.ok) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed with status ${response.status}`;

    throw new ApiError(response.status, message, body);
  }

  return body as T;
}
