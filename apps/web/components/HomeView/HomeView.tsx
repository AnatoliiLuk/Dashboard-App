'use client';

import { Typography } from '@mui/material';

import { AppShell } from '@/components/AppShell';
import { HabitCalendar } from '@/components/HabitCalendar';
import { useHabitLog } from '@/lib/habits/useHabitLog';
import { useTranslation } from '@/lib/i18n';

import { loadingStyle } from '@/app/page.style';

export function HomeView() {
  const { t } = useTranslation();
  const { ready, store, today } = useHabitLog();

  return (
    <AppShell description={t('calendar.description')}>
      {ready && store && today ? (
        <HabitCalendar store={store} today={today} />
      ) : (
        <Typography sx={loadingStyle}>{t('common.loading')}</Typography>
      )}
    </AppShell>
  );
}
