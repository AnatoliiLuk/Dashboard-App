'use client';

import { Box, Button } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { HabitTag } from '@/components/HabitTag';
import { useTranslation } from '@/lib/i18n';

import {
  timePercent,
  timelineCaption,
  timelineLabel,
} from './GoalCard.helpers';
import type { GoalCardProps } from './GoalCard.interface';
import {
  actionsStyle,
  bandStyle,
  bodyStyle,
  chipsStyle,
  footerStyle,
  goalStyle,
  selectedGoalStyle,
} from './GoalCard.style';
import { GoalCardHeader } from './GoalCardHeader';
import { GoalHabitChart } from './GoalHabitChart';
import { GoalTimeBar } from './GoalTimeBar';

function GoalCard({
  goal,
  habits,
  timeline,
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
  const caption = timelineCaption(timeline, t);
  const percent = timePercent(timeline);

  let actions: ReactNode;
  if (confirmDelete) {
    actions = (
      <>
        <Button
          type="button"
          variant="outlined"
          color="error"
          onClick={() => {
            void onDelete(goal.id);
          }}
        >
          {t('common.delete')}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => setConfirmDelete(false)}
        >
          {t('common.cancel')}
        </Button>
      </>
    );
  } else {
    actions = (
      <>
        <Button
          type="button"
          variant="outlined"
          aria-pressed={selected}
          onClick={onEdit}
        >
          {t('common.edit')}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => setConfirmDelete(true)}
        >
          {t('common.delete')}
        </Button>
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
        <GoalCardHeader
          name={goal.name}
          caption={caption}
          startDate={goal.startDate}
          endDate={goal.endDate}
        />
        <GoalTimeBar
          percent={percent}
          percentLabel={t('goals.percent', { percent })}
          label={caption}
          color={goal.color}
        />
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
        <GoalHabitChart
          days={timeline.days}
          habitCount={goal.habitIds.length}
          color={goal.color}
          label={timelineLabel(timeline, t)}
        />
        <Box sx={footerStyle}>
          <Box sx={actionsStyle}>{actions}</Box>
        </Box>
      </Box>
    </Box>
  );
}

export { GoalCard };
