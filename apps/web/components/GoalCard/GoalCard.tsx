'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, LinearProgress, TextField, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { GoalColorPicker } from '@/components/GoalColorPicker';
import { GoalDateField } from '@/components/GoalDateField';
import { GoalHabitSelect } from '@/components/GoalHabitSelect';
import { HabitTag } from '@/components/HabitTag';
import { registerField } from '@/lib/forms/registerField';
import { goalFormSchema, type GoalFormValues } from '@/lib/forms/schemas';
import { formatDisplay } from '@/lib/habits/dates';
import { useTranslation } from '@/lib/i18n';

import type { GoalCardProps } from './GoalCard.interface';
import {
  actionsStyle,
  bandStyle,
  bodyStyle,
  chipsStyle,
  datesStyle,
  deleteStyle,
  editFieldsStyle,
  editFieldStyle,
  goalStyle,
  nameStyle,
  percentStyle,
  progressRowStyle,
  progressStyle,
  rangeStyle,
  toggleStyle,
  topStyle,
} from './GoalCard.style';

function GoalCard({
  goal,
  habits,
  percent,
  onUpdate,
  onDelete,
}: GoalCardProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draftColor, setDraftColor] = useState(goal.color);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema(t)),
    defaultValues: {
      name: goal.name,
      color: goal.color,
      startDate: goal.startDate,
      endDate: goal.endDate,
      habitIds: goal.habitIds,
    },
  });
  const shownColor = editing ? draftColor : goal.color;
  const linked = goal.habitIds.flatMap((id) => {
    const habit = habits.find((item) => item.id === id);
    return habit ? [habit] : [];
  });

  function beginEdit() {
    reset({
      name: goal.name,
      color: goal.color,
      startDate: goal.startDate,
      endDate: goal.endDate,
      habitIds: [...goal.habitIds],
    });
    setDraftColor(goal.color);
    setConfirmDelete(false);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function save(values: GoalFormValues) {
    try {
      await onUpdate(goal.id, values);
    } catch {
      return undefined;
    }
    setEditing(false);
  }

  let habitHelper: string = t('goals.habitsHint');
  if (errors.habitIds?.message) {
    habitHelper = errors.habitIds.message;
  }

  let actions: ReactNode;
  if (editing) {
    actions = (
      <>
        <Box component="button" type="submit" sx={toggleStyle}>
          {t('common.save')}
        </Box>
        <Box
          component="button"
          type="button"
          sx={toggleStyle}
          onClick={cancelEdit}
        >
          {t('common.cancel')}
        </Box>
      </>
    );
  } else if (confirmDelete) {
    actions = (
      <>
        <Box
          component="button"
          type="button"
          sx={[toggleStyle, deleteStyle]}
          onClick={() => {
            void onDelete(goal.id);
          }}
        >
          {t('common.delete')}
        </Box>
        <Box
          component="button"
          type="button"
          sx={toggleStyle}
          onClick={() => setConfirmDelete(false)}
        >
          {t('common.cancel')}
        </Box>
      </>
    );
  } else {
    actions = (
      <>
        <Box
          component="button"
          type="button"
          sx={toggleStyle}
          onClick={beginEdit}
        >
          {t('common.edit')}
        </Box>
        <Box
          component="button"
          type="button"
          sx={toggleStyle}
          onClick={() => setConfirmDelete(true)}
        >
          {t('common.delete')}
        </Box>
      </>
    );
  }

  let details: ReactNode;
  if (editing) {
    details = (
      <Box sx={editFieldsStyle}>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <GoalColorPicker
              value={field.value}
              onChange={(color) => {
                field.onChange(color);
                setDraftColor(color);
              }}
              label={t('goals.goalColor', { name: goal.name })}
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
            />
          )}
        />
      </Box>
    );
  } else {
    details = (
      <>
        <Typography variant="body2" sx={rangeStyle}>
          {t('goals.range', {
            start: formatDisplay(goal.startDate),
            end: formatDisplay(goal.endDate),
          })}
        </Typography>
        {linked.length > 0 ? (
          <Box
            component="ul"
            sx={chipsStyle}
            aria-label={t('goals.linkedHabits')}
          >
            {linked.map((habit) => (
              <Box component="li" key={habit.id}>
                <HabitTag name={habit.name} color={habit.color} />
              </Box>
            ))}
          </Box>
        ) : null}
      </>
    );
  }

  return (
    <Box component="li" sx={goalStyle}>
      <Box sx={bandStyle(shownColor)} aria-hidden="true" />
      <Box
        component="form"
        noValidate
        sx={bodyStyle}
        onSubmit={(event) => {
          if (!editing) {
            event.preventDefault();
            return;
          }
          void handleSubmit(save)(event);
        }}
      >
        <Box sx={topStyle}>
          {editing ? (
            <TextField
              label={t('goals.name')}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              size="small"
              autoFocus
              sx={editFieldStyle}
              {...registerField(register('name'))}
            />
          ) : (
            <Typography variant="h6" component="h2" sx={nameStyle}>
              {goal.name}
            </Typography>
          )}
          <Box sx={actionsStyle}>{actions}</Box>
        </Box>
        {details}
        <Box sx={progressRowStyle}>
          <LinearProgress
            variant="determinate"
            value={percent}
            aria-label={t('goals.progress')}
            sx={progressStyle(shownColor)}
          />
          <Typography variant="body2" component="span" sx={percentStyle}>
            {t('goals.percent', { percent })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export { GoalCard };
