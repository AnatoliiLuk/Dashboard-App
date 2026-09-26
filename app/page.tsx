'use client';

import { Typography } from '@mui/material';

import { HabitCalendar } from '@/components/HabitCalendar';
import { HabitShell } from '@/components/HabitShell';
import { useHabitLog } from '@/lib/habits/useHabitLog';
import { useTranslation } from '@/lib/i18n';

import { loadingStyle } from './page.style';

export default function Home() {
  const { t } = useTranslation();
  const { ready, store, today } = useHabitLog();

  return (
    <HabitShell description={t('calendar.description')}>
      {ready && store && today ? (
        <HabitCalendar store={store} today={today} />
      ) : (
        <Typography sx={loadingStyle}>{t('common.loading')}</Typography>
      )}
    </HabitShell>
  );
}
