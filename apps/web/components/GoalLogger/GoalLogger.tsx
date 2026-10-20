'use client';

import { Box, Button, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import { GoalCard } from '@/components/GoalCard';
import { GoalForm } from '@/components/GoalForm';
import { PageIntro } from '@/components/PageIntro';
import { SegmentedControl } from '@/components/SegmentedControl';
import type { GoalFormValues } from '@/lib/forms/schemas';
import { useTranslation } from '@/lib/i18n';

import { GOAL_SORTS, goalSortLabel } from './GoalLogger.constants';
import { loadGoalSort, saveGoalSort, sortGoals } from './GoalLogger.helpers';
import type { GoalLoggerProps } from './GoalLogger.interface';
import { emptyStyle, listStyle } from './GoalLogger.style';

export function GoalLogger({
  goals,
  habits,
  onAdd,
  onUpdate,
  onArchive,
  onDelete,
}: GoalLoggerProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [sort, setSort] = useState(loadGoalSort);
  const [showArchived, setShowArchived] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const editing =
    goals.find((item) => item.goal.id === editingId)?.goal ?? null;
  const formHabits = habits.filter(
    (habit) => !habit.archivedAt || editing?.habitIds.includes(habit.id),
  );
  const archivedCount = goals.filter((item) => item.goal.archivedAt).length;
  const sorted = useMemo(
    () =>
      sortGoals(
        goals.filter((item) => Boolean(item.goal.archivedAt) === showArchived),
        sort,
      ),
    [goals, showArchived, sort],
  );
  const showToolbar = sorted.length > 0 || archivedCount > 0 || showArchived;
  const emptyText = showArchived ? t('goals.archiveEmpty') : t('goals.empty');

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

  function addGoal(values: GoalFormValues) {
    const result = onAdd(values);
    setFormOpen(false);
    return result;
  }

  async function saveGoal(id: string, values: GoalFormValues) {
    await onUpdate(id, values);
    closeForm();
  }

  return (
    <section>
      <PageIntro
        description={t('goals.description')}
        actionLabel={formOpen ? undefined : t('goals.addGoal')}
        onAction={formOpen ? undefined : openNew}
      />
      {formOpen ? (
        <Box ref={formRef}>
          <GoalForm
            key={editing?.id ?? 'new'}
            habits={formHabits}
            editing={editing}
            onAdd={addGoal}
            onUpdate={saveGoal}
            onCancel={closeForm}
          />
        </Box>
      ) : null}
      {showToolbar ? (
        <SegmentedControl
          label={t('common.sortBy')}
          value={sort}
          options={GOAL_SORTS.map((option) => ({
            id: option,
            label: t(goalSortLabel[option]),
          }))}
          onChange={(option) => {
            saveGoalSort(option);
            setSort(option);
          }}
          action={
            archivedCount > 0 || showArchived ? (
              <Button type="button" variant="outlined" onClick={toggleArchived}>
                {showArchived
                  ? t('goals.showCurrent')
                  : t('goals.showArchived', { count: archivedCount })}
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
            <GoalCard
              key={item.goal.id}
              goal={item.goal}
              habits={habits}
              timeline={item.timeline}
              selected={item.goal.id === editing?.id}
              onEdit={() => beginEdit(item.goal.id)}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </section>
  );
}
