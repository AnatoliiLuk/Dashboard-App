'use client';

import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';

import { HabitTag } from '@/components/HabitTag';
import { formatDisplay } from '@/lib/habits/dates';
import { useTranslation } from '@/lib/i18n';

import { statusIcon } from './HabitCard.constants';
import { streakMessage } from './HabitCard.helpers';
import type { HabitCardProps } from './HabitCard.interface';
import {
  actionsStyle,
  dayDoneStyle,
  dayStyle,
  daysStyle,
  deleteStyle,
  footerStyle,
  habitNameStyle,
  habitStyle,
  habitTopStyle,
  messageStyle,
  selectedHabitStyle,
  toggleStyle,
} from './HabitCard.style';

function HabitCard({
  item,
  selected = false,
  onToggle,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const { t } = useTranslation();
  const { habit, currentStreak, doneToday, days } = item;
  const { id, name, color } = habit;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { text, status } = streakMessage(currentStreak, doneToday, t);
  const StatusIcon = statusIcon[status];

  return (
    <Box
      component="li"
      sx={selected ? [habitStyle, selectedHabitStyle] : habitStyle}
    >
      <Box sx={habitTopStyle}>
        <Box sx={habitNameStyle}>
          <HabitTag name={name} color={color} />
        </Box>
        <Box sx={actionsStyle}>
          <Button
            type="button"
            variant={doneToday ? 'outlined' : 'contained'}
            aria-pressed={doneToday}
            onClick={() => onToggle(id)}
          >
            {doneToday ? t('log.undo') : t('log.doneToday')}
          </Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={messageStyle(status)}>
        <StatusIcon />
        {text}
      </Typography>
      <Box sx={footerStyle}>
        <Box sx={daysStyle} aria-hidden="true">
          {days.map(({ date, done }) => (
            <Box
              key={date}
              sx={done ? dayDoneStyle : dayStyle}
              title={formatDisplay(date)}
            />
          ))}
        </Box>
        <Box sx={actionsStyle}>
          {confirmDelete ? (
            <>
              <Box
                component="button"
                type="button"
                sx={[toggleStyle, deleteStyle]}
                onClick={() => onDelete(id)}
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
          ) : (
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
          )}
        </Box>
      </Box>
    </Box>
  );
}

export { HabitCard };
