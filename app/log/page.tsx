'use client';

import { Typography } from '@mui/material';

import { HabitLogger } from '@/components/HabitLogger';
import { AppShell } from '@/components/AppShell';
import { useHabitLog } from '@/lib/habits/useHabitLog';
import { useTranslation } from '@/lib/i18n';

import { loadingStyle } from '../page.style';

export default function LogPage() {
  const { t } = useTranslation();
  const {
    ready,
    habits,
    addHabit,
    toggleToday,
    setHabitColor,
    renameHabit,
    deleteHabit,
  } = useHabitLog();

  return (
    <AppShell description={t('log.description')}>
      {ready ? (
        <HabitLogger
          habits={habits}
          onAdd={addHabit}
          onToggle={toggleToday}
          onColor={setHabitColor}
          onRename={renameHabit}
          onDelete={deleteHabit}
        />
      ) : (
        <Typography sx={loadingStyle}>{t('common.loading')}</Typography>
      )}
    </AppShell>
  );
}
