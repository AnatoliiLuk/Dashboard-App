'use client';

import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { formatDisplay } from '@/lib/habits/dates';
import type { HabitToday } from '@/lib/habits/useHabitLog';

import { streakMessage } from './HabitLogger.helpers';
import {
  dayDoneStyle,
  dayStyle,
  daysStyle,
  emptyStyle,
  formStyle,
  habitNameStyle,
  habitStyle,
  habitTopStyle,
  listStyle,
  messageStyle,
  nameFieldStyle,
  toggleStyle,
} from './HabitLogger.style';

type HabitLoggerProps = {
  habits: HabitToday[];
  onAdd: (name: string) => void;
  onToggle: (habitId: string) => void;
};

export function HabitLogger({ habits, onAdd, onToggle }: HabitLoggerProps) {
  const [name, setName] = useState('');

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    onAdd(trimmed);
    setName('');
  }

  return (
    <section>
      <Box
        component="form"
        sx={formStyle}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <TextField
          label="Habit"
          name="habit"
          value={name}
          onChange={(event) => setName(event.target.value)}
          sx={nameFieldStyle}
          size="small"
        />
        <Button type="submit" variant="contained">
          Add
        </Button>
      </Box>

      {habits.length === 0 ? (
        <Typography sx={emptyStyle}>Add a habit to start a streak.</Typography>
      ) : (
        <Box component="ul" sx={listStyle}>
          {habits.map((item) => (
            <Box component="li" key={item.habit.id} sx={habitStyle}>
              <Box sx={habitTopStyle}>
                <Typography sx={habitNameStyle}>{item.habit.name}</Typography>
                <Box
                  component="button"
                  type="button"
                  sx={toggleStyle}
                  aria-pressed={item.doneToday}
                  onClick={() => onToggle(item.habit.id)}
                >
                  {item.doneToday ? 'Undo' : 'Done today'}
                </Box>
              </Box>
              <Typography variant="body2" sx={messageStyle}>
                {streakMessage(item.currentStreak, item.doneToday)}
              </Typography>
              <Box sx={daysStyle} aria-hidden="true">
                {item.days.map((day) => (
                  <Box
                    key={day.date}
                    sx={day.done ? dayDoneStyle : dayStyle}
                    title={formatDisplay(day.date)}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </section>
  );
}
