import { describe, expect, it, jest } from '@jest/globals';
import type { ApiUser, ChangePasswordResponse } from '@repo/api-client';
import type { ChangePasswordDto, UpdateProfileDto } from '@repo/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { authKeys } from '@/lib/api/query-keys';

const updateMe = jest.fn<(dto: UpdateProfileDto) => Promise<ApiUser>>();
const changePassword =
  jest.fn<(dto: ChangePasswordDto) => Promise<ChangePasswordResponse>>();

jest.mock('@/lib/api/client', () => ({
  api: {
    users: {
      updateMe: (dto: UpdateProfileDto) => updateMe(dto),
      changePassword: (dto: ChangePasswordDto) => changePassword(dto),
    },
  },
}));

// Imported after the mocks so the hooks use the fakes.
import { useChangePassword, useUpdateProfile } from './useAccount';

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe('useUpdateProfile', () => {
  it('writes the returned profile into the auth.me query', async () => {
    const profile: ApiUser = {
      id: 'user-a',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      createdAt: '2026-10-01T09:00:00.000Z',
    };
    updateMe.mockResolvedValue(profile);
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    await act(() => result.current.mutateAsync({ name: 'Ada Lovelace' }));

    expect(queryClient.getQueryData(authKeys.me)).toEqual(profile);
  });
});

describe('useChangePassword', () => {
  it('cancels in-flight queries before the old session token stops working', async () => {
    changePassword.mockResolvedValue({ token: 'new-token' });
    const { queryClient, wrapper } = setup();
    const cancel = jest.spyOn(queryClient, 'cancelQueries');
    const { result } = renderHook(() => useChangePassword(), { wrapper });

    await act(() =>
      result.current.mutateAsync({
        currentPassword: 'long-enough',
        newPassword: 'brand-new-secret',
      }),
    );

    expect(cancel).toHaveBeenCalled();
    expect(cancel.mock.invocationCallOrder[0]).toBeLessThan(
      changePassword.mock.invocationCallOrder[0],
    );
  });
});
