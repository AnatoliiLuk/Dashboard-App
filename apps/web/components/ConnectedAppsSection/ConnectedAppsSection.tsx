'use client';

import { Alert, Box, Button, Typography } from '@mui/material';
import type { OAuthGrant, OAuthScope } from '@repo/types';
import { useState } from 'react';

import {
  actionsStyle,
  commandRowStyle,
  commandStyle,
  contentStyle,
  listStyle,
  nameStyle,
  rowStyle,
  secondaryTextStyle,
  setupStyle,
  setupTitleRowStyle,
  setupTitleStyle,
} from './ConnectedAppsSection.style';
import { AccountSection } from '@/components/AccountSection';
import { AiBadge } from '@/components/AiBadge';
import { mcpUrl } from '@/lib/api/client';
import { formatDateTime } from '@/lib/habits/dates';
import {
  useConnectedApps,
  useDisconnectApp,
} from '@/lib/hooks/useConnectedApps';
import { displayLocale, useTranslation } from '@/lib/i18n';

const SCOPE_KEYS = {
  'habits:read': 'account.apps.scopeRead',
  'habits:write': 'account.apps.scopeWrite',
} as const satisfies Record<OAuthScope, string>;

// Apps that reach the MCP server through OAuth (ADR 0004), and how to
// connect one, so people learn the feature exists.
export function ConnectedAppsSection() {
  const { t } = useTranslation();

  return (
    <AccountSection
      title={t('account.apps.title')}
      description={t('account.apps.description')}
      badge={<AiBadge />}
    >
      <Box sx={contentStyle}>
        <ConnectedAppsList />
        <ClaudeCodeSetup />
      </Box>
    </AccountSection>
  );
}

function ConnectedAppsList() {
  const { t } = useTranslation();
  const apps = useConnectedApps();
  const disconnect = useDisconnectApp();
  const [confirming, setConfirming] = useState<string | null>(null);

  if (apps.isPending) {
    return (
      <Typography variant="body2" sx={secondaryTextStyle}>
        {t('account.apps.loading')}
      </Typography>
    );
  }
  if (apps.isError) {
    return <Alert severity="error">{t('account.apps.loadFailed')}</Alert>;
  }
  if (apps.data.length === 0) {
    return <Typography variant="body2">{t('account.apps.empty')}</Typography>;
  }

  function confirm(clientId: string) {
    setConfirming(null);
    disconnect.mutate(clientId);
  }

  return (
    <Box sx={rowStyle}>
      <Box component="ul" sx={listStyle}>
        {apps.data.map((grant) => (
          <ConnectedAppRow
            key={grant.clientId}
            grant={grant}
            confirming={confirming === grant.clientId}
            disconnecting={
              disconnect.isPending && disconnect.variables === grant.clientId
            }
            onDisconnect={() => {
              disconnect.reset();
              setConfirming(grant.clientId);
            }}
            onConfirm={() => confirm(grant.clientId)}
            onCancel={() => setConfirming(null)}
          />
        ))}
      </Box>
      {disconnect.isError ? (
        <Alert severity="error">{t('account.apps.disconnectFailed')}</Alert>
      ) : null}
    </Box>
  );
}

function ConnectedAppRow({
  grant,
  confirming,
  disconnecting,
  onDisconnect,
  onConfirm,
  onCancel,
}: {
  grant: OAuthGrant;
  confirming: boolean;
  disconnecting: boolean;
  onDisconnect: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = displayLocale(i18n.resolvedLanguage ?? i18n.language);
  // Self-declared by the app, so shown as plain text only.
  const name = grant.clientName ?? t('account.apps.unnamed');

  return (
    <Box component="li" sx={rowStyle}>
      <Box>
        <Typography variant="body1" sx={nameStyle}>
          {name}
        </Typography>
        <Typography variant="body2" sx={secondaryTextStyle}>
          {grant.scopes.map((scope) => t(SCOPE_KEYS[scope])).join(' · ')}
        </Typography>
        <Typography variant="body2" sx={secondaryTextStyle}>
          {t('account.apps.lastUsed', {
            time: formatDateTime(grant.lastUsedAt, locale),
          })}
        </Typography>
      </Box>
      <Box sx={actionsStyle}>
        {confirming ? (
          <>
            <Typography variant="body2">
              {t('account.apps.disconnectConfirm', { client: name })}
            </Typography>
            <Button
              type="button"
              variant="outlined"
              color="error"
              size="small"
              onClick={onConfirm}
            >
              {t('account.apps.disconnect')}
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={disconnecting}
            onClick={onDisconnect}
          >
            {disconnecting
              ? t('account.apps.disconnecting')
              : t('account.apps.disconnect')}
          </Button>
        )}
      </Box>
    </Box>
  );
}

function ClaudeCodeSetup() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const command = `claude mcp add --transport http habits-plus ${mcpUrl}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied('done');
    } catch {
      // No clipboard outside a secure context, or permission denied.
      setCopied('failed');
    }
  }

  return (
    <Box sx={setupStyle}>
      <Box sx={setupTitleRowStyle}>
        <Typography variant="subtitle2" component="h3" sx={setupTitleStyle}>
          {t('account.apps.claudeCodeTitle')}
        </Typography>
        <AiBadge />
      </Box>
      <Typography variant="body2" sx={secondaryTextStyle}>
        {t('account.apps.claudeCodeSteps')}
      </Typography>
      <Box sx={commandRowStyle}>
        <Box
          component="code"
          aria-label={t('account.apps.commandLabel')}
          sx={commandStyle}
        >
          {command}
        </Box>
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={() => void copy()}
        >
          {t('account.apps.copy')}
        </Button>
      </Box>
      {copied === 'done' ? (
        <Typography role="status" variant="body2">
          {t('account.apps.copied')}
        </Typography>
      ) : null}
      {copied === 'failed' ? (
        <Alert severity="warning">{t('account.apps.copyFailed')}</Alert>
      ) : null}
    </Box>
  );
}
