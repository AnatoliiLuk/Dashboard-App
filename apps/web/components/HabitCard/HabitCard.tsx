'use client';

import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { ColorPicker } from '@/components/ColorPicker';
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
  editFieldStyle,
  footerStyle,
  habitColorStyle,
  habitNameStyle,
  habitStyle,
  habitTopStyle,
  messageStyle,
  toggleStyle,
} from './HabitCard.style';

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
          ) : (
            <Button
              type="button"
              variant={doneToday ? 'outlined' : 'contained'}
              aria-pressed={doneToday}
              onClick={() => onToggle(id)}
            >
              {doneToday ? t('log.undo') : t('log.doneToday')}
            </Button>
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
        {editing ? null : (
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
                  onClick={() => {
                    setName(savedName);
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
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export { HabitCard };
