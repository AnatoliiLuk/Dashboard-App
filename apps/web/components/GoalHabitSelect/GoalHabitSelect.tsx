'use client';

import { Autocomplete, TextField } from '@mui/material';
import type { Habit } from '@repo/types';

import { MAX_GOAL_HABITS } from '@/lib/goals/constants';

import { habitSelectStyle } from './GoalHabitSelect.style';

type GoalHabitSelectProps = {
  habits: Habit[];
  value: string[];
  onChange: (habitIds: string[]) => void;
  label: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

function GoalHabitSelect({
  habits,
  value,
  onChange,
  label,
  error = false,
  helperText,
  disabled = false,
}: GoalHabitSelectProps) {
  const selected = habits.filter((habit) => value.includes(habit.id));
  const atLimit = selected.length >= MAX_GOAL_HABITS;

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      disabled={disabled}
      options={habits}
      value={selected}
      sx={habitSelectStyle}
      getOptionLabel={(habit) => habit.name}
      isOptionEqualToValue={(option, selectedHabit) =>
        option.id === selectedHabit.id
      }
      getOptionDisabled={(option) =>
        atLimit && !selected.some((habit) => habit.id === option.id)
      }
      onChange={(_event, next) => {
        onChange(next.slice(0, MAX_GOAL_HABITS).map((habit) => habit.id));
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          size="small"
        />
      )}
    />
  );
}

export { GoalHabitSelect };
