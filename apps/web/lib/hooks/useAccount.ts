'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileDto } from '@repo/types';

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
