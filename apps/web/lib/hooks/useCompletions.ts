'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCompletionDto } from '@repo/types';

import { api } from '@/lib/api/client';
import { toCompletion } from '@/lib/api/mappers';
import { completionKeys, habitKeys } from '@/lib/api/query-keys';
import { useAuthToken } from '@/lib/hooks/useAuth';

export function useCompletions() {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  const completionsQuery = useQuery({
    queryKey: completionKeys.all,
    queryFn: async () => {
      const completions = await api.completions.getAll();
      return completions.map(toCompletion);
    },
    enabled: Boolean(token),
  });

  const invalidateRelated = () => {
    void queryClient.invalidateQueries({ queryKey: completionKeys.all });
    // Habits include recent completions in list responses.
    void queryClient.invalidateQueries({ queryKey: habitKeys.all });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateCompletionDto) => api.completions.create(dto),
    onSuccess: invalidateRelated,
  });

  const toggleMutation = useMutation({
    mutationFn: (dto: CreateCompletionDto) => api.completions.toggle(dto),
    onSuccess: invalidateRelated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.completions.delete(id),
    onSuccess: invalidateRelated,
  });

  return {
    completions: completionsQuery.data ?? [],
    isLoading: completionsQuery.isLoading,
    isError: completionsQuery.isError,
    error: completionsQuery.error,
    refetch: completionsQuery.refetch,
    createCompletion: createMutation.mutateAsync,
    toggleCompletion: toggleMutation.mutateAsync,
    deleteCompletion: deleteMutation.mutateAsync,
    createMutation,
    toggleMutation,
    deleteMutation,
  };
}
