'use client';

import { Box } from '@mui/material';

import { sectionsStyle } from './AccountView.style';
import { AppShell } from '@/components/AppShell';
import { AuthGuard } from '@/components/AuthGuard';
import { CoachSection } from '@/components/CoachSection';
import { DangerZoneSection } from '@/components/DangerZoneSection';
import { PageIntro } from '@/components/PageIntro';
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
      <PageIntro description={t('account.description')} />
      <Box sx={sectionsStyle}>
        <ProfileSection />
        <SecuritySection />
        <CoachSection />
        <DangerZoneSection />
      </Box>
    </>
  );
}
