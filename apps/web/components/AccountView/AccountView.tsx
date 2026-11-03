'use client';

import { Box } from '@mui/material';

import { sectionsStyle } from './AccountView.style';
import { AppShell } from '@/components/AppShell';
import { AuthGuard } from '@/components/AuthGuard';
import { CoachSection } from '@/components/CoachSection';
import { ConnectedAppsSection } from '@/components/ConnectedAppsSection';
import { DangerZoneSection } from '@/components/DangerZoneSection';
import { PageHeader } from '@/components/PageHeader';
import { ProfileSection } from '@/components/ProfileSection';
import { SecuritySection } from '@/components/SecuritySection';
import { useTranslation } from '@/lib/i18n';

export function AccountView() {
  return (
    <AppShell>
      <AuthGuard>
        <AccountContent />
      </AuthGuard>
    </AppShell>
  );
}

// Each section saves on its own, so one busy form never blocks another.
function AccountContent() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t('shell.account')} />
      <Box sx={sectionsStyle}>
        <ProfileSection />
        <SecuritySection />
        <CoachSection />
        <ConnectedAppsSection />
        <DangerZoneSection />
      </Box>
    </>
  );
}
