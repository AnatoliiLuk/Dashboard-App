'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChangePasswordDto, UpdateProfileDto } from '@repo/types';

import { api } from '@/lib/api/client';
import { authKeys } from '@/lib/api/query-keys';

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
