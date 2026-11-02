'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ChangePasswordDto,
  DeleteAccountDto,
  UpdateProfileDto,
} from '@repo/types';

import { api } from '@/lib/api/client';
import { authKeys } from '@/lib/api/query-keys';
import { setSignedIn } from '@/lib/api/session';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => api.users.updateMe(dto),
    // The response is the full profile, so no refetch of /auth/me is needed.
    onSuccess: (profile) => {
      queryClient.setQueryData(authKeys.me, profile);
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => api.users.changePassword(dto),
    // The change invalidates the current session token. A request still in
    // flight with the old cookie would come back 401 and sign this device
    // out, so stop them first. The response sets the new cookie.
    onMutate: async () => {
      await queryClient.cancelQueries();
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: DeleteAccountDto) => api.users.deleteMe(dto),
    // Requests still in flight would come back 401 once the user is gone.
    onMutate: async () => {
      await queryClient.cancelQueries();
    },
    // The server cleared the cookie. Signing out here drops every cached
    // query, the same as the Sign out button.
    onSuccess: () => {
      setSignedIn(false);
    },
  });
}
