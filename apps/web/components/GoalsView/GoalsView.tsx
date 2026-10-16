'use client';

import { goalTimeline, today } from '@repo/core';
import { Button, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';

import { loadingStyle } from '@/app/page.style';
import { AppShell } from '@/components/AppShell';
import { AuthGuard } from '@/components/AuthGuard';
import { GoalLogger } from '@/components/GoalLogger';
import { useCompletions } from '@/lib/hooks/useCompletions';
import { useGoals } from '@/lib/hooks/useGoals';
import { useHabits } from '@/lib/hooks/useHabits';
import { useTranslation } from '@/lib/i18n';
import type { GoalFormValues } from '@/lib/forms/schemas';

export function GoalsView() {
  const { t } = useTranslation();

  return (
    <AppShell description={t('goals.description')}>
      <AuthGuard>
        <GoalsContent />
      </AuthGuard>
    </AppShell>
  );
}

function GoalsContent() {
  const { t } = useTranslation();
  const {
    goals,
    isLoading: goalsLoading,
    isError: goalsError,
    refetch: refetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useGoals();
  const {
    habits,
    isLoading: habitsLoading,
    isError: habitsError,
    refetch: refetchHabits,
  } = useHabits();
  const {
    completions,
    isLoading: completionsLoading,
    isError: completionsError,
    refetch: refetchCompletions,
  } = useCompletions();

  const isError = goalsError || habitsError || completionsError;
  const ready = !goalsLoading && !habitsLoading && !completionsLoading;
  const items = useMemo(
    () =>
      goals.map((goal) => ({
        goal,
        timeline: goalTimeline(
          goal.startDate,
          goal.endDate,
          goal.habitIds,
          completions,
          today(),
        ),
      })),
    [completions, goals],
  );

  async function refetch() {
    await Promise.all([refetchGoals(), refetchHabits(), refetchCompletions()]);
  }

  async function addGoal(values: GoalFormValues) {
    await createGoal(values);
  }

  async function editGoal(id: string, values: GoalFormValues) {
    await updateGoal(id, values);
  }

  if (isError) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Typography sx={loadingStyle}>{t('common.error')}</Typography>
        <Button variant="outlined" onClick={() => void refetch()}>
          {t('common.tryAgain')}
        </Button>
      </Stack>
    );
  }

  if (!ready) {
    return <Typography sx={loadingStyle}>{t('goals.loading')}</Typography>;
  }

  return (
    <GoalLogger
      goals={items}
      habits={habits}
      onAdd={addGoal}
      onUpdate={editGoal}
      onDelete={deleteGoal}
    />
  );
}
