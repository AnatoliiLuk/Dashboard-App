'use client';

import { useEffect, useState } from 'react';

import { today } from './dates';
import { addHabit, habitTodayList, toggleToday, type HabitToday } from './log';
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
    addHabit(name: string) {
      if (!store || !date) {
        return;
      }
      update(addHabit(store, name, date));
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
