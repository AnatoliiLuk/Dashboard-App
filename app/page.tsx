'use client';

import { Typography } from '@mui/material';

import { HabitCalendar } from '@/components/HabitCalendar';
import { HabitShell } from '@/components/HabitShell';
import { useHabitLog } from '@/lib/habits/useHabitLog';

import { loadingStyle } from './page.style';

export default function Home() {
  const { ready, store, today } = useHabitLog();

  return (
    <HabitShell description="Each day lists the habits you marked done.">
      {ready && store && today ? (
        <HabitCalendar store={store} today={today} />
      ) : (
        <Typography sx={loadingStyle}>Loading habits…</Typography>
      )}
    </HabitShell>
  );
}
