'use client';

import { Box, Link } from '@mui/material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { accountTabs } from './AccountLayout.constants';
import {
  layoutStyle,
  navStyle,
  sectionsStyle,
  tabActiveStyle,
  tabBadgeStyle,
  tabStyle,
} from './AccountLayout.style';
import { AiBadge } from '@/components/AiBadge';
import { AppShell } from '@/components/AppShell';
import { AuthGuard } from '@/components/AuthGuard';
import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from '@/lib/i18n';

type AccountLayoutProps = {
  children: ReactNode;
};

// Shared by every account tab, so the header and tabs stay put while only
// the sections change.
export function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <AppShell>
      <AuthGuard>
        <AccountContent>{children}</AccountContent>
      </AuthGuard>
    </AppShell>
  );
}

// Each section saves on its own, so one busy form never blocks another.
function AccountContent({ children }: AccountLayoutProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <>
      <PageHeader title={t('shell.account')} />
      <Box sx={layoutStyle}>
        <Box component="nav" aria-label={t('account.nav.label')} sx={navStyle}>
          {accountTabs.map(({ href, label, ai }) => {
            const current = pathname === href;
            return (
              <Link
                key={href}
                component={NextLink}
                href={href}
                underline="none"
                aria-current={current ? 'page' : undefined}
                sx={[tabStyle, current ? tabActiveStyle : null]}
              >
                {t(label)}
                {ai ? <AiBadge sx={tabBadgeStyle} /> : null}
              </Link>
            );
          })}
        </Box>
        <Box sx={sectionsStyle}>{children}</Box>
      </Box>
    </>
  );
}
