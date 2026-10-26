'use client';

import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';

import { HabitTag } from '@/components/HabitTag';
import { useTranslation } from '@/lib/i18n';

import type {
  HabitProposalCardProps,
  ProposalState,
} from './HabitProposalCard.interface';
import {
  actionsStyle,
  cardStyle,
  labelStyle,
  statusStyle,
} from './HabitProposalCard.style';

// The coach can only suggest. Nothing is saved until the person accepts.
function HabitProposalCard({ proposal, onAccept }: HabitProposalCardProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<ProposalState>('open');

  if (state === 'dismissed') return null;

  async function accept() {
    setState('adding');
    try {
      await onAccept(proposal);
      setState('added');
    } catch {
      setState('failed');
    }
  }

  return (
    <Box
      component="section"
      aria-label={t('coach.proposal.label')}
      sx={cardStyle}
    >
      <Typography variant="body2" sx={labelStyle}>
        {t('coach.proposal.label')}
      </Typography>
      <Box>
        <HabitTag name={proposal.name} color={proposal.color} wrap />
      </Box>
      <Typography variant="body2">{proposal.reason}</Typography>
      {state === 'added' ? (
        <Typography variant="body2" role="status" sx={statusStyle(false)}>
          {t('coach.proposal.added')}
        </Typography>
      ) : (
        <>
          {state === 'failed' ? (
            <Typography variant="body2" role="alert" sx={statusStyle(true)}>
              {t('coach.proposal.failed')}
            </Typography>
          ) : null}
          <Box sx={actionsStyle}>
            <Button
              type="button"
              variant="contained"
              disabled={state === 'adding'}
              onClick={() => void accept()}
            >
              {state === 'adding'
                ? t('coach.proposal.adding')
                : t('coach.proposal.add')}
            </Button>
            <Button
              type="button"
              variant="outlined"
              disabled={state === 'adding'}
              onClick={() => setState('dismissed')}
            >
              {t('coach.proposal.dismiss')}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export { HabitProposalCard };
