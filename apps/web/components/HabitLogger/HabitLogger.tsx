'use client';

import { Box, Typography } from '@mui/material';
import { useMemo, useRef, useState } from 'react';

import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import { SegmentedControl } from '@/components/SegmentedControl';
import type { HabitFormValues } from '@/lib/forms/schemas';
import { useTranslation } from '@/lib/i18n';

import { HABIT_SORTS, habitSortLabel } from './HabitLogger.constants';
import {
  loadHabitSort,
  saveHabitSort,
  sortHabits,
} from './HabitLogger.helpers';
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
  const [sort, setSort] = useState(loadHabitSort);
  const formRef = useRef<HTMLDivElement>(null);
  const editing =
    habits.find((item) => item.habit.id === editingId)?.habit ?? null;
  const sorted = useMemo(() => sortHabits(habits, sort), [habits, sort]);

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
      {sorted.length === 0 ? (
        <Typography sx={emptyStyle}>{t('log.empty')}</Typography>
      ) : (
        <>
          <SegmentedControl
            label={t('common.sortBy')}
            value={sort}
            options={HABIT_SORTS.map((option) => ({
              id: option,
              label: t(habitSortLabel[option]),
            }))}
            onChange={(option) => {
              saveHabitSort(option);
              setSort(option);
            }}
          />
          <Box component="ul" sx={listStyle}>
            {sorted.map((item) => (
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
        </>
      )}
    </section>
  );
}
