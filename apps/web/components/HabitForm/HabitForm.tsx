'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { ColorPicker } from '@/components/ColorPicker';
import { registerField } from '@/lib/forms/registerField';
import { habitFormSchema, type HabitFormValues } from '@/lib/forms/schemas';
import { HABIT_COLORS } from '@/lib/habits/colors';
import { useTranslation } from '@/lib/i18n';

import { formStyle, nameFieldStyle } from './HabitForm.style';

type HabitFormProps = {
  onAdd: (name: string, color: HabitFormValues['color']) => void;
};

function HabitForm({ onAdd }: HabitFormProps) {
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema(t)),
    defaultValues: { name: '', color: HABIT_COLORS[0].id },
  });

  function submit(values: HabitFormValues) {
    onAdd(values.name, values.color);
    reset({ name: '', color: values.color });
  }

  return (
    <Box
      component="form"
      noValidate
      sx={formStyle}
      onSubmit={handleSubmit(submit)}
    >
      <TextField
        label={t('common.habit')}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        sx={nameFieldStyle}
        size="small"
        {...registerField(register('name'))}
      />
      <Controller
        name="color"
        control={control}
        render={({ field }) => (
          <ColorPicker
            value={field.value}
            onChange={field.onChange}
            label={t('log.newHabitColor')}
          />
        )}
      />
      <Button type="submit" variant="contained">
        {t('common.add')}
      </Button>
    </Box>
  );
}

export { HabitForm };
