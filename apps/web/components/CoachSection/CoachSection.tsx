'use client';

import { Alert, Box, Button, LinearProgress, Typography } from '@mui/material';
import { useState } from 'react';

import {
  actionsStyle,
  secondaryTextStyle,
  sectionStyle,
  usageStyle,
} from './CoachSection.style';
import { formatDateTime } from '@/lib/habits/dates';
import { useClearConversation, useCoachUsage } from '@/lib/hooks/useCoach';
import { displayLocale, useTranslation } from '@/lib/i18n';

export function CoachSection() {
  const { t } = useTranslation();
  const clear = useClearConversation();
  const [confirming, setConfirming] = useState(false);

  function confirmClear() {
    setConfirming(false);
    clear.mutate();
  }

  return (
    <Box component="section" sx={sectionStyle}>
      <Typography variant="h6" component="h2">
        {t('account.coach.title')}
      </Typography>

      <CoachUsageSummary />

      {/* Works with the coach off too: the saved chat can always be deleted. */}
      <Box sx={actionsStyle}>
        {confirming ? (
          <>
            <Typography variant="body2">
              {t('account.coach.clearConfirm')}
            </Typography>
            <Button
              type="button"
              variant="outlined"
              color="error"
              onClick={confirmClear}
            >
              {t('common.deleteForever')}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setConfirming(false)}
            >
              {t('common.cancel')}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outlined"
            disabled={clear.isPending}
            onClick={() => {
              clear.reset();
              setConfirming(true);
            }}
          >
            {clear.isPending
              ? t('account.coach.clearing')
              : t('account.coach.clear')}
          </Button>
        )}
        {clear.isSuccess && !confirming ? (
          <Typography role="status" variant="body2">
            {t('account.coach.cleared')}
          </Typography>
        ) : null}
      </Box>
      {clear.isError ? (
        <Alert severity="error">{t('account.coach.clearFailed')}</Alert>
      ) : null}
    </Box>
  );
}

function CoachUsageSummary() {
  const { t, i18n } = useTranslation();
  const locale = displayLocale(i18n.resolvedLanguage ?? i18n.language);
  const usage = useCoachUsage();

  if (usage.isPending) {
    return (
      <Typography variant="body2" sx={secondaryTextStyle}>
        {t('account.coach.loading')}
      </Typography>
    );
  }
  if (usage.isError) {
    return <Alert severity="error">{t('account.coach.loadFailed')}</Alert>;
  }
  if (!usage.data.enabled) {
    return (
      <Typography variant="body2">{t('account.coach.disabled')}</Typography>
    );
  }

  const { usedTokens, dailyLimit, resetsAt } = usage.data;
  return (
    <Box sx={usageStyle}>
      <Typography variant="body2">
        {t('account.coach.usage', {
          used: usedTokens.toLocaleString(locale),
          limit: dailyLimit.toLocaleString(locale),
        })}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percentUsed(usedTokens, dailyLimit)}
        aria-label={t('account.coach.usageLabel')}
      />
      <Typography variant="body2" sx={secondaryTextStyle}>
        {t('account.coach.resetsAt', {
          time: formatDateTime(resetsAt, locale),
        })}
      </Typography>
    </Box>
  );
}

function percentUsed(used: number, limit: number): number {
  if (limit <= 0) return 100;
  return Math.min(100, (used / limit) * 100);
}
