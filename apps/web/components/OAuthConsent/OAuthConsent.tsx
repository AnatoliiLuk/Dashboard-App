'use client';

import { Alert, Box, Button, Typography } from '@mui/material';
import type { OAuthScope } from '@repo/types';

import {
  actionsStyle,
  contentStyle,
  scopeListStyle,
} from './OAuthConsent.style';
import type { OAuthConsentProps } from './OAuthConsent.interface';
import { AccountSection } from '@/components/AccountSection';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDecideConsent, useOAuthConsent } from '@/lib/hooks/useOAuthConsent';
import { useTranslation } from '@/lib/i18n';

const SCOPE_KEYS = {
  'habits:read': 'oauth.scopeRead',
  'habits:write': 'oauth.scopeWrite',
} as const satisfies Record<OAuthScope, string>;

function leave(url: string) {
  window.location.assign(url);
}

// The approval step of the MCP OAuth flow (ADR 0004). Either button sends
// the browser back to the app that asked, with a code or with access_denied.
export function OAuthConsent({ request, navigate = leave }: OAuthConsentProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const consent = useOAuthConsent(request);
  const decide = useDecideConsent();

  if (!request || consent.isError) {
    return <Alert severity="error">{t('oauth.invalid')}</Alert>;
  }
  if (!consent.data) {
    return <Typography>{t('common.loading')}</Typography>;
  }

  const { clientName, redirectHost, scopes } = consent.data;
  // Leaving the page takes a moment; keep the buttons off until it happens.
  const busy = decide.isPending || decide.isSuccess;

  async function choose(approve: boolean) {
    const { redirectTo } = await decide.mutateAsync({ request, approve });
    navigate(redirectTo);
  }

  return (
    <AccountSection
      title={t('oauth.heading', {
        client: clientName ?? t('oauth.unknownClient'),
      })}
      description={user ? t('oauth.signedInAs', { email: user.email }) : ''}
    >
      <Box sx={contentStyle}>
        <Box>
          <Typography>{t('oauth.scopesLabel')}</Typography>
          <Box component="ul" sx={scopeListStyle}>
            {scopes.map((scope) => (
              <Typography component="li" key={scope}>
                {t(SCOPE_KEYS[scope])}
              </Typography>
            ))}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('oauth.returnTo', { host: redirectHost })}
        </Typography>
        <Alert severity="warning">{t('oauth.trust')}</Alert>
        {decide.isError ? (
          <Alert severity="error">{t('common.error')}</Alert>
        ) : null}
        <Box sx={actionsStyle}>
          <Button
            type="button"
            variant="outlined"
            disabled={busy}
            onClick={() => void choose(false).catch(() => undefined)}
          >
            {t('oauth.deny')}
          </Button>
          <Button
            type="button"
            variant="contained"
            disabled={busy}
            onClick={() => void choose(true).catch(() => undefined)}
          >
            {busy ? t('oauth.working') : t('oauth.allow')}
          </Button>
        </Box>
      </Box>
    </AccountSection>
  );
}
