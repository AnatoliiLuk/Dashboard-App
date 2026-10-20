'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateGoalDto, UpdateGoalDto } from '@repo/types';

import { api } from '@/lib/api/client';
import { toGoal } from '@/lib/api/mappers';
import { goalKeys } from '@/lib/api/query-keys';
import { useAuth } from '@/lib/hooks/useAuth';

export function useGoals() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const goalsQuery = useQuery({
    queryKey: goalKeys.all,
    queryFn: async () => {
      const goals = await api.goals.getAll();
      return goals.map(toGoal);
    },
    enabled: isAuthenticated,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: goalKeys.all });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateGoalDto) => api.goals.create(dto),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateGoalDto }) =>
      api.goals.update(id, dto),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.goals.delete(id),
    onSuccess: invalidate,
  });

  return {
    goals: goalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading,
    isError: goalsQuery.isError,
    error: goalsQuery.error,
    refetch: goalsQuery.refetch,
    createGoal: createMutation.mutateAsync,
    updateGoal: (id: string, dto: UpdateGoalDto) =>
      updateMutation.mutateAsync({ id, dto }),
    deleteGoal: deleteMutation.mutateAsync,
  };
}
