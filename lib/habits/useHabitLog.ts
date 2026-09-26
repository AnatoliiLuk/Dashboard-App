'use client';

import { useEffect, useState } from 'react';

import type { HabitColor } from './colors';
import { today } from './dates';
import {
  addHabit,
  habitTodayList,
  setHabitColor,
  toggleToday,
  type HabitToday,
} from './log';
import { loadHabitStore, saveHabitStore, type HabitStore } from './storage';

export function useHabitLog() {
  const [store, setStore] = useState<HabitStore | null>(null);
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadHabitStore();
    saveHabitStore(loaded);
    setDate(today());
    setStore(loaded);
  }, []);

  function update(next: HabitStore) {
    saveHabitStore(next);
    setStore(next);
  }

  return {
    ready: store !== null && date !== null,
    today: date,
    store,
    habits: store && date ? habitTodayList(store, date) : [],
    addHabit(name: string, color: HabitColor) {
      if (!store || !date) {
        return;
      }
      update(addHabit(store, name, date, color));
    },
    setHabitColor(habitId: string, color: HabitColor) {
      if (!store) {
        return;
      }
      update(setHabitColor(store, habitId, color));
    },
    toggleToday(habitId: string) {
      if (!store || !date) {
        return;
      }
      update(toggleToday(store, habitId, date));
    },
  };
}

export type { HabitToday };
