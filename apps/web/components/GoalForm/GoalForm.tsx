'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField, Typography } from '@mui/material';
import type { Habit } from '@repo/types';
import { Controller, useForm } from 'react-hook-form';

import { GoalColorPicker } from '@/components/GoalColorPicker';
import { GoalDateField } from '@/components/GoalDateField';
import { GoalHabitSelect } from '@/components/GoalHabitSelect';
import { registerField } from '@/lib/forms/registerField';
import { goalFormSchema, type GoalFormValues } from '@/lib/forms/schemas';
import { GOAL_COLORS } from '@/lib/goals/colors';
import { today } from '@/lib/habits/dates';
import { useTranslation } from '@/lib/i18n';

import {
  datesStyle,
  formStyle,
  noteStyle,
  submitStyle,
} from './GoalForm.style';

type GoalFormProps = {
  habits: Habit[];
  onAdd: (values: GoalFormValues) => void | Promise<void>;
};

function GoalForm({ habits, onAdd }: GoalFormProps) {
  const { t } = useTranslation();
  const disabled = habits.length === 0;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema(t)),
    defaultValues: {
      name: '',
      color: GOAL_COLORS[0].id,
      startDate: today(),
      endDate: today(),
      habitIds: [],
    },
  });

  function submit(values: GoalFormValues) {
    void onAdd(values);
    reset({
      name: '',
      color: values.color,
      startDate: values.startDate,
      endDate: values.endDate,
      habitIds: [],
    });
  }

  let habitHelper: string | undefined = t('goals.habitsHint');
  if (disabled) {
    habitHelper = undefined;
  }
  if (errors.habitIds?.message) {
    habitHelper = errors.habitIds.message;
  }

  return (
    <Box
      component="form"
      noValidate
      sx={formStyle}
      aria-describedby={disabled ? 'goal-form-note' : undefined}
      onSubmit={handleSubmit(submit)}
    >
      {disabled ? (
        <Typography id="goal-form-note" sx={noteStyle}>
          {t('goals.noHabits')}
        </Typography>
      ) : null}
      <TextField
        label={t('goals.name')}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        size="small"
        disabled={disabled}
        {...registerField(register('name'))}
      />
      <Controller
        name="color"
        control={control}
        render={({ field }) => (
          <GoalColorPicker
            value={field.value}
            onChange={field.onChange}
            label={t('goals.newGoalColor')}
            disabled={disabled}
          />
        )}
      />
      <Box sx={datesStyle}>
        <Controller
          name="startDate"
          control={control}
          render={({ field, fieldState }) => (
            <GoalDateField
              label={t('goals.startDate')}
              value={field.value}
              onChange={field.onChange}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field, fieldState }) => (
            <GoalDateField
              label={t('goals.endDate')}
              value={field.value}
              onChange={field.onChange}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
      </Box>
      <Controller
        name="habitIds"
        control={control}
        render={({ field }) => (
          <GoalHabitSelect
            habits={habits}
            value={field.value}
            onChange={field.onChange}
            label={t('goals.habits')}
            error={Boolean(errors.habitIds)}
            helperText={habitHelper}
            disabled={disabled}
          />
        )}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={disabled}
        sx={submitStyle}
      >
        {t('common.add')}
      </Button>
    </Box>
  );
}

export { GoalForm };
