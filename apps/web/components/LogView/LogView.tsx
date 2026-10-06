'use client';

import { Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/AuthGuard';
import { AppShell } from '@/components/AppShell';
import { HabitLogger } from '@/components/HabitLogger';
import { useHabitLog } from '@/lib/habits/useHabitLog';
import { useTranslation } from '@/lib/i18n';

import { loadingStyle } from '@/app/page.style';

export function LogView() {
  const { t } = useTranslation();

  return (
    <AppShell description={t('log.description')}>
      <AuthGuard>
        <LogContent />
      </AuthGuard>
    </AppShell>
  );
}

function LogContent() {
  const { t } = useTranslation();
  const {
    ready,
    isError,
    refetch,
    habits,
    addHabit,
    toggleToday,
    setHabitColor,
    renameHabit,
    deleteHabit,
  } = useHabitLog();

  let content: ReactNode;
  if (isError) {
    content = (
      <Stack spacing={2} alignItems="flex-start">
        <Typography sx={loadingStyle}>{t('common.error')}</Typography>
        <Button variant="outlined" onClick={() => void refetch()}>
          {t('common.tryAgain')}
        </Button>
      </Stack>
    );
  } else if (ready) {
    content = (
      <HabitLogger
        habits={habits}
        onAdd={addHabit}
        onToggle={toggleToday}
        onColor={setHabitColor}
        onRename={renameHabit}
        onDelete={deleteHabit}
      />
    );
  } else {
    content = <Typography sx={loadingStyle}>{t('common.loading')}</Typography>;
  }

  return content;
}
