'use client';

import { Box, Typography } from '@mui/material';

import { GoalCard } from '@/components/GoalCard';
import { GoalForm } from '@/components/GoalForm';
import { useTranslation } from '@/lib/i18n';

import type { GoalLoggerProps } from './GoalLogger.interface';
import { emptyStyle, listStyle } from './GoalLogger.style';

export function GoalLogger({
  goals,
  habits,
  onAdd,
  onUpdate,
  onDelete,
}: GoalLoggerProps) {
  const { t } = useTranslation();

  return (
    <section>
      <GoalForm habits={habits} onAdd={onAdd} />
      {goals.length === 0 ? (
        <Typography sx={emptyStyle}>{t('goals.empty')}</Typography>
      ) : (
        <Box component="ul" sx={listStyle}>
          {goals.map((item) => (
            <GoalCard
              key={item.goal.id}
              goal={item.goal}
              habits={habits}
              percent={item.percent}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </section>
  );
}
