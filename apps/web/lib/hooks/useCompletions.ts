'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Completion, CreateCompletionDto } from '@repo/types';

import { api } from '@/lib/api/client';
import { toCompletion } from '@/lib/api/mappers';
import { completionKeys, habitKeys } from '@/lib/api/query-keys';
import { useAuth } from '@/lib/hooks/useAuth';

export function useCompletions() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const completionsQuery = useQuery({
    queryKey: completionKeys.all,
    queryFn: async () => {
      const completions = await api.completions.getAll();
      return completions.map(toCompletion);
    },
    enabled: isAuthenticated,
  });

  const invalidateRelated = () => {
    void queryClient.invalidateQueries({ queryKey: completionKeys.all });
    // Habits include recent completions in list responses.
    void queryClient.invalidateQueries({ queryKey: habitKeys.all });
  };

  // Optimistic, so tapping several days in a row feels instant.
  const toggleMutation = useMutation({
    mutationFn: (dto: CreateCompletionDto) => api.completions.toggle(dto),
    onMutate: async ({ habitId, date }) => {
      await queryClient.cancelQueries({ queryKey: completionKeys.all });
      const previous = queryClient.getQueryData<Completion[]>(
        completionKeys.all,
      );
      queryClient.setQueryData<Completion[]>(completionKeys.all, (current) =>
        toggleLocal(current ?? [], habitId, date),
      );
      return { previous };
    },
    onError: (_error, _dto, context) => {
      if (context?.previous) {
        queryClient.setQueryData(completionKeys.all, context.previous);
      }
    },
    onSettled: invalidateRelated,
  });

  return {
    completions: completionsQuery.data ?? [],
    isLoading: completionsQuery.isLoading,
    isError: completionsQuery.isError,
    error: completionsQuery.error,
    refetch: completionsQuery.refetch,
    toggleCompletion: toggleMutation.mutateAsync,
  };
}

function toggleLocal(
  completions: Completion[],
  habitId: string,
  date: string,
): Completion[] {
  const matches = (item: Completion) =>
    item.habitId === habitId && item.date === date;
  if (completions.some(matches)) {
    return completions.filter((item) => !matches(item));
  }
  return [
    ...completions,
    { id: `pending-${habitId}-${date}`, habitId, ownerId: '', date },
  ];
}
