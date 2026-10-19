'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField, Typography } from '@mui/material';
import type { Habit } from '@repo/types';
import { Controller, useForm } from 'react-hook-form';

import { ColorSelect } from '@/components/ColorSelect';
import { registerField } from '@/lib/forms/registerField';
import { habitFormSchema, type HabitFormValues } from '@/lib/forms/schemas';
import { HABIT_COLORS } from '@/lib/habits/colors';
import { useTranslation } from '@/lib/i18n';

import {
  actionsStyle,
  colorFieldStyle,
  editingStyle,
  fieldsStyle,
  formStyle,
} from './HabitForm.style';

type HabitFormProps = {
  editing?: Habit | null;
  onAdd: (
    name: string,
    color: HabitFormValues['color'],
  ) => void | Promise<void>;
  onUpdate?: (id: string, values: HabitFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

function blankHabit(): HabitFormValues {
  return {
    name: '',
    color: HABIT_COLORS[0].id,
  };
}

function valuesFromHabit(habit: Habit): HabitFormValues {
  return {
    name: habit.name,
    color: habit.color,
  };
}

function HabitForm({
  editing = null,
  onAdd,
  onUpdate,
  onCancel,
}: HabitFormProps) {
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema(t)),
    defaultValues: editing ? valuesFromHabit(editing) : blankHabit(),
  });

  function submit(values: HabitFormValues) {
    if (editing) {
      return onUpdate?.(editing.id, values);
    }

    void onAdd(values.name, values.color);
    reset({ name: '', color: values.color });
  }

  return (
    <Box
      component="form"
      noValidate
      sx={formStyle}
      aria-labelledby={editing ? 'habit-form-editing' : undefined}
      onSubmit={handleSubmit(submit)}
    >
      {editing ? (
        <Typography id="habit-form-editing" sx={editingStyle}>
          {t('log.editing', { name: editing.name })}
        </Typography>
      ) : null}
      <Box sx={fieldsStyle}>
        <TextField
          label={t('common.habit')}
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          size="small"
          fullWidth
          autoFocus
          {...registerField(register('name'))}
        />
        <Box sx={colorFieldStyle}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorSelect
                value={field.value}
                options={HABIT_COLORS}
                onChange={field.onChange}
                label={t('common.color')}
              />
            )}
          />
        </Box>
        <Box sx={actionsStyle}>
          <Button type="submit" variant="contained">
            {editing ? t('common.save') : t('common.add')}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outlined" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

export { HabitForm };
