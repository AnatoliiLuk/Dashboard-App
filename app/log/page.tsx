'use client';

import { Typography } from '@mui/material';

import { HabitLogger } from '@/components/HabitLogger';
import { HabitShell } from '@/components/HabitShell';
import { useHabitLog } from '@/lib/habits/useHabitLog';

import { loadingStyle } from '../page.style';

export default function LogPage() {
  const log = useHabitLog();

  return (
    <HabitShell
      title="Log habits"
      description="Add a habit and mark what you did today."
    >
      {log.ready ? (
        <HabitLogger
          habits={log.habits}
          onAdd={log.addHabit}
          onToggle={log.toggleToday}
        />
      ) : (
        <Typography sx={loadingStyle}>Loading habits…</Typography>
      )}
    </HabitShell>
  );
}
