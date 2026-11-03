import { describe, expect, it, jest } from '@jest/globals';
import type { ApiUser, ChangePasswordResponse } from '@repo/api-client';
import type {
  ChangePasswordDto,
  DeleteAccountDto,
  UpdateProfileDto,
} from '@repo/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { authKeys } from '@/lib/api/query-keys';
import { getSignedIn, setSignedIn } from '@/lib/api/session';

const updateMe = jest.fn<(dto: UpdateProfileDto) => Promise<ApiUser>>();
const changePassword =
  jest.fn<(dto: ChangePasswordDto) => Promise<ChangePasswordResponse>>();
const deleteMe = jest.fn<(dto: DeleteAccountDto) => Promise<void>>();

jest.mock('@/lib/api/client', () => ({
  api: {
    users: {
      updateMe: (dto: UpdateProfileDto) => updateMe(dto),
      changePassword: (dto: ChangePasswordDto) => changePassword(dto),
      deleteMe: (dto: DeleteAccountDto) => deleteMe(dto),
    },
  },
}));

// Imported after the mocks so the hooks use the fakes.
import {
  useChangePassword,
  useDeleteAccount,
  useUpdateProfile,
} from './useAccount';

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

describe('useDeleteAccount', () => {
  it('cancels in-flight queries, then signs out once the account is gone', async () => {
    setSignedIn(true);
    deleteMe.mockResolvedValue(undefined);
    const { queryClient, wrapper } = setup();
    const cancel = jest.spyOn(queryClient, 'cancelQueries');
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    await act(() => result.current.mutateAsync({ password: 'long-enough' }));

    expect(cancel).toHaveBeenCalled();
    expect(deleteMe).toHaveBeenCalledWith({ password: 'long-enough' });
    expect(getSignedIn()).toBe(false);
  });

  it('keeps the session when the password is wrong', async () => {
    setSignedIn(true);
    deleteMe.mockRejectedValue(new Error('wrong password'));
    const { wrapper } = setup();
    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    await act(() =>
      result.current.mutateAsync({ password: 'wrong' }).catch(() => undefined),
    );

    expect(getSignedIn()).toBe(true);
  });
});
