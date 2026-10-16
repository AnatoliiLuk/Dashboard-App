'use client';

import { Box, Typography } from '@mui/material';
import { useRef, useState } from 'react';

import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import type { HabitFormValues } from '@/lib/forms/schemas';
import { useTranslation } from '@/lib/i18n';

import type { HabitLoggerProps } from './HabitLogger.interface';
import { emptyStyle, listStyle } from './HabitLogger.style';

export function HabitLogger({
  habits,
  onAdd,
  onUpdate,
  onToggle,
  onDelete,
}: HabitLoggerProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const editing =
    habits.find((item) => item.habit.id === editingId)?.habit ?? null;

  function beginEdit(id: string) {
    setEditingId(id);
    if (typeof formRef.current?.scrollIntoView === 'function') {
      formRef.current.scrollIntoView({ block: 'start' });
    }
  }

  async function saveHabit(id: string, values: HabitFormValues) {
    await onUpdate(id, values);
    setEditingId(null);
  }

  return (
    <section>
      <Box ref={formRef}>
        <HabitForm
          key={editing?.id ?? 'new'}
          editing={editing}
          onAdd={onAdd}
          onUpdate={saveHabit}
          onCancel={() => setEditingId(null)}
        />
      </Box>
      {habits.length === 0 ? (
        <Typography sx={emptyStyle}>{t('log.empty')}</Typography>
      ) : (
        <Box component="ul" sx={listStyle}>
          {habits.map((item) => (
            <HabitCard
              key={item.habit.id}
              item={item}
              selected={item.habit.id === editing?.id}
              onToggle={onToggle}
              onEdit={() => beginEdit(item.habit.id)}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </section>
  );
}
