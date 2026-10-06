'use client';

import { Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { AppShell } from '@/components/AppShell';
import { HabitCalendar } from '@/components/HabitCalendar';
import { useHabitLog } from '@/lib/habits/useHabitLog';
import { useTranslation } from '@/lib/i18n';

import { loadingStyle } from '@/app/page.style';

export function HomeView() {
  const { t } = useTranslation();
  const { ready, needsAuth, isError, refetch, store, today } = useHabitLog();

  let content: ReactNode;
  if (needsAuth) {
    content = (
      <Typography sx={loadingStyle}>{t('common.signInRequired')}</Typography>
    );
  } else if (isError) {
    content = (
      <Stack spacing={2} alignItems="flex-start">
        <Typography sx={loadingStyle}>{t('common.error')}</Typography>
        <Button variant="outlined" onClick={() => void refetch()}>
          {t('common.tryAgain')}
        </Button>
      </Stack>
    );
  } else if (ready && store) {
    content = <HabitCalendar store={store} today={today} />;
  } else {
    content = <Typography sx={loadingStyle}>{t('common.loading')}</Typography>;
  }

  return <AppShell description={t('calendar.description')}>{content}</AppShell>;
}
