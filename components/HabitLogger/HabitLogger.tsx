'use client';

import { Box, Typography } from '@mui/material';

import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import type { HabitColor } from '@/lib/habits/colors';
import type { HabitToday } from '@/lib/habits/useHabitLog';

import { emptyStyle, listStyle } from './HabitLogger.style';

type HabitLoggerProps = {
  habits: HabitToday[];
  onAdd: (name: string, color: HabitColor) => void;
  onToggle: (habitId: string) => void;
  onColor: (habitId: string, color: HabitColor) => void;
};

export function HabitLogger({
  habits,
  onAdd,
  onToggle,
  onColor,
}: HabitLoggerProps) {
  return (
    <section>
      <HabitForm onAdd={onAdd} />
      {habits.length === 0 ? (
        <Typography sx={emptyStyle}>Add a habit to start a streak.</Typography>
      ) : (
        <Box component="ul" sx={listStyle}>
          {habits.map((item) => (
            <HabitCard
              key={item.habit.id}
              item={item}
              onToggle={onToggle}
              onColor={onColor}
            />
          ))}
        </Box>
      )}
    </section>
  );
}
