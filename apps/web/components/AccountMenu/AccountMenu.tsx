'use client';

import {
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  Popover,
  Skeleton,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import { AiBadge } from '@/components/AiBadge';
import { SignOutIcon, SparkleIcon, UserIcon } from '@/components/icons';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

import {
  dividerStyle,
  emailStyle,
  identityStyle,
  nameStyle,
  paperStyle,
  placeholderStyle,
  rowActiveStyle,
  rowStyle,
  settingLabelStyle,
  settingStyle,
  triggerActiveStyle,
  triggerStyle,
} from './AccountMenu.style';

// Account, preferences and sign-out behind one button, so the header keeps
// room for the pages people switch between every day.
export function AccountMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthReady, isAuthenticated, user, logout } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const panelId = useId();
  const open = anchor !== null;

  // Same size as the trigger, so the header does not shift once auth is known.
  if (!isAuthReady) {
    return <Skeleton variant="circular" aria-hidden sx={placeholderStyle} />;
  }

  if (!isAuthenticated) {
    return (
      <Button variant="outlined" component={NextLink} href="/login">
        {t('shell.signIn')}
      </Button>
    );
  }

  const close = () => setAnchor(null);
  // The trigger lights up on every account tab; each row only on its own.
  const inAccount = pathname === '/account' || pathname.startsWith('/account/');
  const onAiApps = pathname === '/account/ai';
  const onAccount = inAccount && !onAiApps;
  const initial = user?.name.trim().charAt(0).toUpperCase();

  return (
    <>
      <IconButton
        aria-label={t('shell.accountMenu')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={[triggerStyle, inAccount || open ? triggerActiveStyle : null]}
      >
        {initial ? (
          <span aria-hidden>{initial}</span>
        ) : (
          <UserIcon width={16} height={16} />
        )}
      </IconButton>
      <Popover
        id={panelId}
        open={open}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-label': t('shell.accountMenu'),
            sx: paperStyle,
          },
        }}
      >
        {user ? (
          <Box sx={identityStyle}>
            <Typography noWrap sx={nameStyle}>
              {user.name}
            </Typography>
            <Typography variant="body2" noWrap sx={emailStyle}>
              {user.email}
            </Typography>
          </Box>
        ) : null}
        <Link
          component={NextLink}
          href="/account"
          underline="none"
          aria-current={onAccount ? 'page' : undefined}
          onClick={close}
          sx={[rowStyle, onAccount ? rowActiveStyle : null]}
        >
          <UserIcon width={16} height={16} />
          {t('shell.account')}
        </Link>
        {/* A shortcut, so people find the coach settings and Claude Code. */}
        <Link
          component={NextLink}
          href="/account/ai"
          underline="none"
          aria-current={onAiApps ? 'page' : undefined}
          onClick={close}
          sx={[rowStyle, onAiApps ? rowActiveStyle : null]}
        >
          <SparkleIcon width={16} height={16} />
          {t('account.nav.ai')}
          <AiBadge />
        </Link>
        <Divider sx={dividerStyle} />
        <Box sx={settingStyle}>
          <Typography variant="body2" component="span" sx={settingLabelStyle}>
            {t('theme.label')}
          </Typography>
          <ThemeToggle />
        </Box>
        <Box sx={settingStyle}>
          <Typography variant="body2" component="span" sx={settingLabelStyle}>
            {t('locale.label')}
          </Typography>
          <LocaleSwitch />
        </Box>
        <Divider sx={dividerStyle} />
        <Box
          component="button"
          type="button"
          onClick={() => {
            close();
            logout();
            router.replace('/login');
          }}
          sx={rowStyle}
        >
          <SignOutIcon width={16} height={16} />
          {t('shell.signOut')}
        </Box>
      </Popover>
    </>
  );
}
