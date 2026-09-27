'use client';

import { Box, Typography } from '@mui/material';

import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import { useTranslation } from '@/lib/i18n';

import type { HabitLoggerProps } from './HabitLogger.interface';
import { emptyStyle, listStyle } from './HabitLogger.style';

export function HabitLogger({
  habits,
  onAdd,
  onToggle,
  onColor,
  onRename,
  onDelete,
}: HabitLoggerProps) {
  const { t } = useTranslation();

  return (
    <section>
      <HabitForm onAdd={onAdd} />
      {habits.length === 0 ? (
        <Typography sx={emptyStyle}>{t('log.empty')}</Typography>
      ) : (
        <Box component="ul" sx={listStyle}>
          {habits.map((item) => (
            <HabitCard
              key={item.habit.id}
              item={item}
              onToggle={onToggle}
              onColor={onColor}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </section>
  );
}
