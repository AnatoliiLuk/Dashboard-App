'use client';

import { Box, Typography } from '@mui/material';

import { HabitProposalCard } from '@/components/HabitProposalCard';
import { useTranslation } from '@/lib/i18n';

import type { CoachMessageProps } from './CoachMessage.interface';
import {
  authorStyle,
  bubbleStyle,
  messageStyle,
  noteStyle,
} from './CoachMessage.style';

function CoachMessage({ entry, onAcceptProposal }: CoachMessageProps) {
  const { t } = useTranslation();
  const fromUser = entry.role === 'user';

  return (
    <Box component="li" sx={messageStyle(fromUser)}>
      <Typography variant="caption" sx={authorStyle}>
        {fromUser ? t('coach.you') : t('coach.coach')}
      </Typography>
      <Typography component="div" sx={bubbleStyle(fromUser)}>
        {entry.content}
      </Typography>
      {entry.role === 'assistant' && entry.truncated ? (
        <Typography variant="caption" sx={noteStyle}>
          {t('coach.truncated')}
        </Typography>
      ) : null}
      {entry.role === 'assistant' && entry.proposal ? (
        <HabitProposalCard
          proposal={entry.proposal}
          onAccept={onAcceptProposal}
        />
      ) : null}
    </Box>
  );
}

export { CoachMessage };
