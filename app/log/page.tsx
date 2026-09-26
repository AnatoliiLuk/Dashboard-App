'use client';

import { Typography } from '@mui/material';

import { HabitLogger } from '@/components/HabitLogger';
import { HabitShell } from '@/components/HabitShell';
import { useHabitLog } from '@/lib/habits/useHabitLog';

import { loadingStyle } from '../page.style';

export default function LogPage() {
  const {
    ready,
    habits,
    addHabit,
    toggleToday,
    setHabitColor,
    renameHabit,
    deleteHabit,
  } = useHabitLog();

  return (
    <HabitShell description="Add a habit and mark what you did today.">
      {ready ? (
        <HabitLogger
          habits={habits}
          onAdd={addHabit}
          onToggle={toggleToday}
          onColor={setHabitColor}
          onRename={renameHabit}
          onDelete={deleteHabit}
        />
      ) : (
        <Typography sx={loadingStyle}>Loading habits…</Typography>
      )}
    </HabitShell>
  );
}
