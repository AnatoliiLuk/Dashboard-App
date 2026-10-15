'use client';

import { Box, Typography } from '@mui/material';
import { useRef, useState } from 'react';

import { GoalCard } from '@/components/GoalCard';
import { GoalForm } from '@/components/GoalForm';
import type { GoalFormValues } from '@/lib/forms/schemas';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const editing =
    goals.find((item) => item.goal.id === editingId)?.goal ?? null;

  function beginEdit(id: string) {
    setEditingId(id);
    if (typeof formRef.current?.scrollIntoView === 'function') {
      formRef.current.scrollIntoView({ block: 'start' });
    }
  }

  async function saveGoal(id: string, values: GoalFormValues) {
    await onUpdate(id, values);
    setEditingId(null);
  }

  return (
    <section>
      <Box ref={formRef}>
        <GoalForm
          key={editing?.id ?? 'new'}
          habits={habits}
          editing={editing}
          onAdd={onAdd}
          onUpdate={saveGoal}
          onCancel={() => setEditingId(null)}
        />
      </Box>
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
              selected={item.goal.id === editing?.id}
              onEdit={() => beginEdit(item.goal.id)}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </section>
  );
}
