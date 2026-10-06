'use client';

import { Box, Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { GuestGuard } from '@/components/GuestGuard';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/lib/i18n';

import { loadingStyle } from '@/app/page.style';

import {
  authBrandStyle,
  authHeaderStyle,
  authLeadStyle,
  authMainStyle,
  authPageStyle,
} from '@/components/AuthForm/AuthForm.style';
import { barEndStyle, barStyle } from '@/components/AppShell/AppShell.style';

type AuthLayoutProps = {
  title: string;
  lead: string;
  children: ReactNode;
};

export function AuthLayout({ title, lead, children }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <Box sx={authPageStyle}>
      <Box component="main" sx={authMainStyle}>
        <Box component="header" sx={authHeaderStyle}>
          <Box sx={barStyle}>
            <Link
              component={NextLink}
              href="/"
              underline="none"
              color="inherit"
            >
              <Typography variant="h1" component="p" sx={authBrandStyle}>
                {t('shell.brand')}
              </Typography>
            </Link>
            <Box sx={barEndStyle}>
              <LocaleSwitch />
              <ThemeToggle />
            </Box>
          </Box>
          <Typography variant="h2" component="h1" sx={{ mt: 3 }}>
            {title}
          </Typography>
          <Typography sx={authLeadStyle}>{lead}</Typography>
        </Box>
        <Suspense
          fallback={
            <Typography sx={loadingStyle}>{t('common.loading')}</Typography>
          }
        >
          <GuestGuard>{children}</GuestGuard>
        </Suspense>
      </Box>
    </Box>
  );
}
