'use client';

import { Autocomplete, Chip, TextField } from '@mui/material';
import type { Habit } from '@repo/types';

import { MAX_GOAL_HABITS } from '@/lib/goals/constants';
import { useTranslation } from '@/lib/i18n';

import { habitSelectStyle } from './GoalHabitSelect.style';

export const VISIBLE_CHIPS = 2;

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
  const { t } = useTranslation();
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
      renderValue={(items, getItemProps) => {
        const hidden = items.length - VISIBLE_CHIPS;

        return (
          <>
            {items.slice(0, VISIBLE_CHIPS).map((habit, index) => {
              const { key, ...itemProps } = getItemProps({ index });

              return (
                <Chip
                  key={key}
                  label={habit.name}
                  size="small"
                  {...itemProps}
                />
              );
            })}
            {hidden > 0 && (
              <Chip
                label={t('goals.moreHabits', { count: hidden })}
                size="small"
              />
            )}
          </>
        );
      }}
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
