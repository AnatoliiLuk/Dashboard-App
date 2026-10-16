'use client';

import { useMemo } from 'react';

import type { HabitColor } from './colors';
import { today } from './dates';
import { habitTodayList, type HabitToday } from './log';
import type { HabitStore } from './types';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCompletions } from '@/lib/hooks/useCompletions';
import { useHabits } from '@/lib/hooks/useHabits';

export function useHabitLog() {
  const { isAuthenticated, user } = useAuth();
  const {
    habits,
    isLoading: habitsLoading,
    isError: habitsError,
    error: habitsErr,
    refetch: refetchHabits,
    createHabit,
    updateHabit,
    deleteHabit: removeHabit,
  } = useHabits();
  const {
    completions,
    isLoading: completionsLoading,
    isError: completionsError,
    error: completionsErr,
    refetch: refetchCompletions,
    toggleCompletion,
  } = useCompletions();

  const date = today();
  const isLoading = isAuthenticated && (habitsLoading || completionsLoading);
  const isError = habitsError || completionsError;
  const error = habitsErr ?? completionsErr ?? null;

  const store: HabitStore | null = useMemo(() => {
    if (!isAuthenticated) {
      return null;
    }

    return {
      ownerId: user?.id ?? 'api',
      habits,
      completions,
    };
  }, [isAuthenticated, user?.id, habits, completions]);

  const ready = isAuthenticated && !isLoading && store !== null;

  async function refetch() {
    await Promise.all([refetchHabits(), refetchCompletions()]);
  }

  return {
    ready,
    isLoading,
    isError,
    error,
    refetch,
    today: date,
    store,
    habits: store ? habitTodayList(store, date) : [],
    async addHabit(name: string, color: HabitColor) {
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }
      await createHabit({ name: trimmed, color });
    },
    async saveHabit(
      habitId: string,
      values: { name: string; color: HabitColor },
    ) {
      const trimmed = values.name.trim();
      if (!trimmed) {
        return;
      }
      await updateHabit(habitId, { name: trimmed, color: values.color });
    },
    async deleteHabit(habitId: string) {
      await removeHabit(habitId);
    },
    async toggleToday(habitId: string) {
      await toggleCompletion({ habitId, date });
    },
  };
}

export type { HabitToday };
