'use client';

import { Box, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { ColorPicker } from '@/components/ColorPicker';
import { HabitTag } from '@/components/HabitTag';
import {
  CircleCheckIcon,
  CircleExclamationIcon,
  CircleInfoIcon,
} from '@/components/icons';
import type { HabitColor } from '@/lib/habits/colors';
import { formatDisplay } from '@/lib/habits/dates';
import { useTranslation } from '@/lib/i18n';
import type { HabitToday } from '@/lib/habits/useHabitLog';

import { streakMessage, type HabitStatus } from './HabitCard.helpers';
import {
  actionsStyle,
  dayDoneStyle,
  dayStyle,
  daysStyle,
  deleteStyle,
  editFieldStyle,
  habitColorStyle,
  habitNameStyle,
  habitStyle,
  habitTopStyle,
  messageStyle,
  toggleStyle,
} from './HabitCard.style';

const statusIcon = {
  success: CircleCheckIcon,
  warning: CircleExclamationIcon,
  info: CircleInfoIcon,
} satisfies Record<HabitStatus, typeof CircleCheckIcon>;

type HabitCardProps = {
  item: HabitToday;
  onToggle: (habitId: string) => void;
  onColor: (habitId: string, color: HabitColor) => void;
  onRename: (habitId: string, name: string) => void;
  onDelete: (habitId: string) => void;
};

function HabitCard({
  item,
  onToggle,
  onColor,
  onRename,
  onDelete,
}: HabitCardProps) {
  const { t } = useTranslation();
  const { habit, currentStreak, doneToday, days } = item;
  const { id, name: savedName, color } = habit;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(savedName);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    onRename(id, trimmed);
    setEditing(false);
  }

  function cancelEdit() {
    setName(savedName);
    setEditing(false);
  }

  const { text, status } = streakMessage(currentStreak, doneToday, t);
  const StatusIcon = statusIcon[status];

  return (
    <Box component="li" sx={habitStyle}>
      <Box sx={habitTopStyle}>
        {editing ? (
          <Box
            component="form"
            sx={editFieldStyle}
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <TextField
              label={t('common.habit')}
              name="habit"
              value={name}
              onChange={(event) => setName(event.target.value)}
              size="small"
              fullWidth
              autoFocus
            />
          </Box>
        ) : (
          <Box sx={habitNameStyle}>
            <HabitTag name={savedName} color={color} />
          </Box>
        )}
        <Box sx={actionsStyle}>
          {editing ? (
            <>
              <Box
                component="button"
                type="button"
                sx={toggleStyle}
                onClick={save}
              >
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
          ) : confirmDelete ? (
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
                onClick={() => {
                  setName(savedName);
                  setConfirmDelete(false);
                  setEditing(true);
                }}
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
              <Box
                component="button"
                type="button"
                sx={toggleStyle}
                aria-pressed={doneToday}
                onClick={() => onToggle(id)}
              >
                {doneToday ? t('log.undo') : t('log.doneToday')}
              </Box>
            </>
          )}
        </Box>
      </Box>
      {editing ? (
        <Box sx={habitColorStyle}>
          <ColorPicker
            value={color}
            onChange={(next) => onColor(id, next)}
            label={t('log.habitColor', { name: savedName })}
          />
        </Box>
      ) : null}
      <Typography variant="body2" sx={messageStyle(status)}>
        <StatusIcon />
        {text}
      </Typography>
      <Box sx={daysStyle} aria-hidden="true">
        {days.map(({ date, done }) => (
          <Box
            key={date}
            sx={done ? dayDoneStyle : dayStyle}
            title={formatDisplay(date)}
          />
        ))}
      </Box>
    </Box>
  );
}

export { HabitCard };
