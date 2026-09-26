'use client';

import { Typography } from '@mui/material';

import { HabitCalendar } from '@/components/HabitCalendar';
import { HabitShell } from '@/components/HabitShell';
import { useHabitLog } from '@/lib/habits/useHabitLog';

import { loadingStyle } from './page.style';

export default function Home() {
  const log = useHabitLog();

  return (
    <HabitShell
      title="Habits"
      description="Each day lists the habits you marked done."
      today={log.today}
    >
      {log.ready && log.store && log.today ? (
        <HabitCalendar store={log.store} today={log.today} />
      ) : (
        <Typography sx={loadingStyle}>Loading habits…</Typography>
      )}
    </HabitShell>
  );
}
