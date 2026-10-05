'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateHabitDto, UpdateHabitDto } from '@repo/types';

import { api } from '@/lib/api/client';
import { toHabit } from '@/lib/api/mappers';
import { habitKeys } from '@/lib/api/query-keys';
import { useAuthToken } from '@/lib/hooks/useAuth';

export function useHabits() {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  const habitsQuery = useQuery({
    queryKey: habitKeys.all,
    queryFn: async () => {
      const habits = await api.habits.getAll();
      return habits.map(toHabit);
    },
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateHabitDto) => api.habits.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateHabitDto }) =>
      api.habits.update(id, dto),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: habitKeys.all });
      void queryClient.invalidateQueries({ queryKey: habitKeys.detail(id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.habits.delete(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: habitKeys.all });
      void queryClient.removeQueries({ queryKey: habitKeys.detail(id) });
    },
  });

  return {
    habits: habitsQuery.data ?? [],
    isLoading: habitsQuery.isLoading,
    isError: habitsQuery.isError,
    error: habitsQuery.error,
    refetch: habitsQuery.refetch,
    createHabit: createMutation.mutateAsync,
    updateHabit: (id: string, dto: UpdateHabitDto) =>
      updateMutation.mutateAsync({ id, dto }),
    deleteHabit: deleteMutation.mutateAsync,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

export function useHabit(id: string) {
  const token = useAuthToken();

  return useQuery({
    queryKey: habitKeys.detail(id),
    queryFn: async () => toHabit(await api.habits.getOne(id)),
    enabled: Boolean(token) && Boolean(id),
  });
}
