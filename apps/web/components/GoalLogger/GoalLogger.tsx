'use client';

import { Box, Typography } from '@mui/material';
import { useMemo, useRef, useState } from 'react';

import { GoalCard } from '@/components/GoalCard';
import { GoalForm } from '@/components/GoalForm';
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
  onDelete,
}: GoalLoggerProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sort, setSort] = useState(loadGoalSort);
  const formRef = useRef<HTMLDivElement>(null);
  const editing =
    goals.find((item) => item.goal.id === editingId)?.goal ?? null;
  const sorted = useMemo(() => sortGoals(goals, sort), [goals, sort]);

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
      {sorted.length === 0 ? (
        <Typography sx={emptyStyle}>{t('goals.empty')}</Typography>
      ) : (
        <>
          <SegmentedControl
            label={t('goals.sort')}
            value={sort}
            options={GOAL_SORTS.map((option) => ({
              id: option,
              label: t(goalSortLabel[option]),
            }))}
            onChange={(option) => {
              saveGoalSort(option);
              setSort(option);
            }}
          />
          <Box component="ul" sx={listStyle}>
            {sorted.map((item) => (
              <GoalCard
                key={item.goal.id}
                goal={item.goal}
                habits={habits}
                timeline={item.timeline}
                selected={item.goal.id === editing?.id}
                onEdit={() => beginEdit(item.goal.id)}
                onDelete={onDelete}
              />
            ))}
          </Box>
        </>
      )}
    </section>
  );
}
