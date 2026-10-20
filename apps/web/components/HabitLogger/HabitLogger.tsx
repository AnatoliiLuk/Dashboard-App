'use client';

import { Box, Button, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import { PageIntro } from '@/components/PageIntro';
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
  onArchive,
  onDelete,
}: HabitLoggerProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [sort, setSort] = useState(loadHabitSort);
  const [showArchived, setShowArchived] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const editing =
    habits.find((item) => item.habit.id === editingId)?.habit ?? null;
  const archivedCount = habits.filter((item) => item.habit.archivedAt).length;
  const sorted = useMemo(
    () =>
      sortHabits(
        habits.filter(
          (item) => Boolean(item.habit.archivedAt) === showArchived,
        ),
        sort,
      ),
    [habits, showArchived, sort],
  );
  const showToolbar = sorted.length > 0 || archivedCount > 0 || showArchived;
  const emptyText = showArchived ? t('log.archiveEmpty') : t('log.empty');

  useEffect(() => {
    if (!formOpen) {
      return;
    }

    const field = formRef.current?.querySelector('input:not([disabled])');
    if (field instanceof HTMLInputElement) {
      field.focus({ preventScroll: true });
    }
    formRef.current?.scrollIntoView?.({ block: 'center' });
  }, [formOpen, editingId]);

  function openNew() {
    setEditingId(null);
    setShowArchived(false);
    setFormOpen(true);
  }

  function toggleArchived() {
    closeForm();
    setShowArchived((current) => !current);
  }

  function beginEdit(id: string) {
    setEditingId(id);
    setFormOpen(true);
  }

  function closeForm() {
    setEditingId(null);
    setFormOpen(false);
  }

  function addHabit(name: string, color: HabitFormValues['color']) {
    const result = onAdd(name, color);
    setFormOpen(false);
    return result;
  }

  async function saveHabit(id: string, values: HabitFormValues) {
    await onUpdate(id, values);
    closeForm();
  }

  return (
    <section>
      <PageIntro
        description={t('log.description')}
        actionLabel={formOpen ? undefined : t('log.addHabit')}
        onAction={formOpen ? undefined : openNew}
      />
      {formOpen ? (
        <Box ref={formRef}>
          <HabitForm
            key={editing?.id ?? 'new'}
            editing={editing}
            onAdd={addHabit}
            onUpdate={saveHabit}
            onCancel={closeForm}
          />
        </Box>
      ) : null}
      {showToolbar ? (
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
          action={
            archivedCount > 0 || showArchived ? (
              <Button type="button" variant="outlined" onClick={toggleArchived}>
                {showArchived
                  ? t('log.showCurrent')
                  : t('log.showArchived', { count: archivedCount })}
              </Button>
            ) : null
          }
        />
      ) : null}
      {sorted.length === 0 ? (
        <Typography sx={emptyStyle}>{emptyText}</Typography>
      ) : (
        <Box component="ul" sx={listStyle}>
          {sorted.map((item) => (
            <HabitCard
              key={item.habit.id}
              item={item}
              selected={item.habit.id === editing?.id}
              onToggle={onToggle}
              onEdit={() => beginEdit(item.habit.id)}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </section>
  );
}
