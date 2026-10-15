'use client';

import { Box, LinearProgress, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { HabitTag } from '@/components/HabitTag';
import { formatDisplay } from '@/lib/habits/dates';
import { useTranslation } from '@/lib/i18n';

import type { GoalCardProps } from './GoalCard.interface';
import {
  actionsStyle,
  bandStyle,
  bodyStyle,
  chipsStyle,
  deleteStyle,
  goalStyle,
  nameStyle,
  percentStyle,
  progressRowStyle,
  progressStyle,
  rangeStyle,
  selectedGoalStyle,
  toggleStyle,
  topStyle,
} from './GoalCard.style';

function GoalCard({
  goal,
  habits,
  percent,
  selected = false,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const linked = goal.habitIds.flatMap((id) => {
    const habit = habits.find((item) => item.id === id);
    return habit ? [habit] : [];
  });

  let actions: ReactNode;
  if (confirmDelete) {
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
          aria-pressed={selected}
          onClick={onEdit}
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

  return (
    <Box
      component="li"
      sx={selected ? [goalStyle, selectedGoalStyle] : goalStyle}
    >
      <Box sx={bandStyle(goal.color)} aria-hidden="true" />
      <Box sx={bodyStyle}>
        <Box sx={topStyle}>
          <Typography variant="h6" component="h2" sx={nameStyle}>
            {goal.name}
          </Typography>
          <Box sx={actionsStyle}>{actions}</Box>
        </Box>
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
        <Box sx={progressRowStyle}>
          <LinearProgress
            variant="determinate"
            value={percent}
            aria-label={t('goals.progress')}
            sx={progressStyle(goal.color)}
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
