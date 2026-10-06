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
  const needsAuth = !isAuthenticated;
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
    needsAuth,
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
    async renameHabit(habitId: string, name: string) {
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }
      await updateHabit(habitId, { name: trimmed });
    },
    async deleteHabit(habitId: string) {
      await removeHabit(habitId);
    },
    async setHabitColor(habitId: string, color: HabitColor) {
      await updateHabit(habitId, { color });
    },
    async toggleToday(habitId: string) {
      await toggleCompletion({ habitId, date });
    },
  };
}

export type { HabitToday };
