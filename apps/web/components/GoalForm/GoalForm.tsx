'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField, Typography } from '@mui/material';
import type { Goal, Habit } from '@repo/types';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { GoalColorPicker } from '@/components/GoalColorPicker';
import { GoalDateField } from '@/components/GoalDateField';
import { GoalHabitSelect } from '@/components/GoalHabitSelect';
import { registerField } from '@/lib/forms/registerField';
import { goalFormSchema, type GoalFormValues } from '@/lib/forms/schemas';
import { GOAL_COLORS } from '@/lib/goals/colors';
import { today } from '@/lib/habits/dates';
import { useTranslation } from '@/lib/i18n';

import {
  actionsStyle,
  colorFieldStyle,
  detailsRowStyle,
  editingStyle,
  formStyle,
  nameRowStyle,
  noteStyle,
} from './GoalForm.style';

type GoalFormProps = {
  habits: Habit[];
  editing?: Goal | null;
  onAdd: (values: GoalFormValues) => void | Promise<void>;
  onUpdate?: (id: string, values: GoalFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

function blankGoal(): GoalFormValues {
  return {
    name: '',
    color: GOAL_COLORS[0].id,
    startDate: today(),
    endDate: today(),
    habitIds: [],
  };
}

function valuesFromGoal(goal: Goal): GoalFormValues {
  return {
    name: goal.name,
    color: goal.color,
    startDate: goal.startDate,
    endDate: goal.endDate,
    habitIds: [...goal.habitIds],
  };
}

function GoalForm({
  habits,
  editing = null,
  onAdd,
  onUpdate,
  onCancel,
}: GoalFormProps) {
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
    defaultValues: editing ? valuesFromGoal(editing) : blankGoal(),
  });
  const startDate = useWatch({ control, name: 'startDate' });
  const endDate = useWatch({ control, name: 'endDate' });

  function submit(values: GoalFormValues) {
    if (editing) {
      return onUpdate?.(editing.id, values);
    }

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
      aria-labelledby={editing ? 'goal-form-editing' : undefined}
      onSubmit={handleSubmit(submit)}
    >
      {editing ? (
        <Typography id="goal-form-editing" sx={editingStyle}>
          {t('goals.editing', { name: editing.name })}
        </Typography>
      ) : null}
      {disabled ? (
        <Typography id="goal-form-note" sx={noteStyle}>
          {t('goals.noHabits')}
        </Typography>
      ) : null}
      <Box sx={nameRowStyle}>
        <TextField
          label={t('goals.name')}
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          size="small"
          fullWidth
          disabled={disabled}
          autoFocus={Boolean(editing)}
          {...registerField(register('name'))}
        />
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
      </Box>
      <Box sx={detailsRowStyle}>
        <Controller
          name="startDate"
          control={control}
          render={({ field, fieldState }) => (
            <GoalDateField
              label={t('goals.startDate')}
              value={field.value}
              onChange={field.onChange}
              rangeStart={startDate}
              rangeEnd={endDate}
              fallbackDate={endDate}
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
              rangeStart={startDate}
              rangeEnd={endDate}
              fallbackDate={startDate}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
        <Box sx={colorFieldStyle}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <GoalColorPicker
                value={field.value}
                onChange={field.onChange}
                label={t('common.color')}
                disabled={disabled}
              />
            )}
          />
        </Box>
        <Box sx={actionsStyle}>
          <Button type="submit" variant="contained" disabled={disabled}>
            {editing ? t('common.save') : t('common.add')}
          </Button>
          {editing ? (
            <Button type="button" variant="outlined" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

export { GoalForm };
