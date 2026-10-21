'use client';

import { Box, Button, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { HabitTag } from '@/components/HabitTag';
import { formatDisplay } from '@/lib/habits/dates';
import { displayLocale, useTranslation } from '@/lib/i18n';

import { statusIcon } from './HabitCard.constants';
import { streakMessage, weekdayInitial } from './HabitCard.helpers';
import type { HabitCardProps } from './HabitCard.interface';
import {
  actionsStyle,
  archivedMessageStyle,
  dayDoneStyle,
  dayStyle,
  daysStyle,
  footerStyle,
  habitNameStyle,
  habitStyle,
  habitTopStyle,
  messageStyle,
  selectedHabitStyle,
} from './HabitCard.style';

function HabitCard({
  item,
  selected = false,
  onToggle,
  onEdit,
  onArchive,
  onDelete,
}: HabitCardProps) {
  const { t, i18n } = useTranslation();
  const locale = displayLocale(i18n.resolvedLanguage ?? i18n.language);
  const { habit, currentStreak, doneToday, days } = item;
  const { id, name, color, archivedAt } = habit;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { text, status } = streakMessage(currentStreak, doneToday, t);
  const StatusIcon = statusIcon[status];

  let actions: ReactNode;
  if (!archivedAt) {
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
          onClick={() => onArchive(id, true)}
        >
          {t('common.archive')}
        </Button>
      </>
    );
  } else if (confirmDelete) {
    actions = (
      <>
        <Button
          type="button"
          variant="outlined"
          color="error"
          onClick={() => onDelete(id)}
        >
          {t('common.deleteForever')}
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
          onClick={() => onArchive(id, false)}
        >
          {t('common.restore')}
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
      sx={selected ? [habitStyle, selectedHabitStyle] : habitStyle}
    >
      <Box sx={habitTopStyle}>
        <Box sx={habitNameStyle}>
          <HabitTag name={name} color={color} />
        </Box>
        {archivedAt ? null : (
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
        )}
      </Box>
      {archivedAt ? (
        <Typography variant="body2" sx={archivedMessageStyle}>
          {t('common.archivedOn', {
            date: formatDisplay(archivedAt.slice(0, 10), locale),
          })}
        </Typography>
      ) : (
        <Typography variant="body2" sx={messageStyle(status)}>
          <StatusIcon />
          {text}
        </Typography>
      )}
      <Box sx={footerStyle}>
        <Box sx={daysStyle}>
          {days.map(({ date, done }) => (
            <Box
              key={date}
              component="span"
              sx={done ? dayDoneStyle : dayStyle}
              title={formatDisplay(date, locale)}
            >
              {weekdayInitial(date, t)}
            </Box>
          ))}
        </Box>
        <Box sx={actionsStyle}>{actions}</Box>
      </Box>
    </Box>
  );
}

export { HabitCard };
