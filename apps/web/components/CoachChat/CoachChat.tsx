'use client';

import { Box, Button, TextField, Typography } from '@mui/material';
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

import { CoachMessage } from '@/components/CoachMessage';
import { CircleInfoIcon, PlusIcon } from '@/components/icons';
import { AiBadge } from '@/components/AiBadge';
import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from '@/lib/i18n';

import { EXAMPLE_QUESTIONS, MAX_MESSAGE_LENGTH } from './CoachChat.constants';
import type { CoachChatProps } from './CoachChat.interface';
import {
  bodyStyle,
  composerStyle,
  errorStyle,
  exampleButtonStyle,
  examplesStyle,
  examplesTitleStyle,
  logStyle,
  noticeStyle,
  rootStyle,
  sendStyle,
  startOverStyle,
  thinkingStyle,
} from './CoachChat.style';

function CoachChat({
  entries,
  isLoading,
  isSending,
  isDeleting,
  retentionDays,
  error,
  onSend,
  onRetry,
  onStartOver,
  onAcceptProposal,
}: CoachChatProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [confirmStartOver, setConfirmStartOver] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const disabled = error === 'disabled';
  const busy = isLoading || isSending || isDeleting;
  const canSend = !busy && !disabled && draft.trim().length > 0;

  // New chat sits in the page header; it hides while its confirmation shows.
  let startOverLabel: string | undefined;
  if (entries.length > 0 && !confirmStartOver) {
    startOverLabel = isDeleting ? t('coach.deleting') : t('coach.startOver');
  }

  // Keep the newest message and the thinking line in view. Only the
  // conversation scrolls; the page itself stays put.
  useEffect(() => {
    const body = bodyRef.current;
    if (body && entries.length) {
      body.scrollTo?.({ top: body.scrollHeight, behavior: 'smooth' });
    }
  }, [entries.length, isSending]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend(draft);
    setDraft('');
  }

  // Enter sends; Shift+Enter starts a new line.
  function handleKeyDown(event: KeyboardEvent) {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <Box sx={rootStyle}>
      <PageHeader
        title={t('shell.coach')}
        badge={<AiBadge />}
        actionLabel={startOverLabel}
        actionIcon={<PlusIcon width={16} height={16} />}
        actionDisabled={busy}
        onAction={() => setConfirmStartOver(true)}
      />
      {confirmStartOver ? (
        <Box sx={startOverStyle}>
          <Typography variant="body2">{t('coach.startOverConfirm')}</Typography>
          <Button
            type="button"
            variant="outlined"
            color="error"
            disabled={busy}
            onClick={() => {
              setConfirmStartOver(false);
              onStartOver();
            }}
          >
            {t('common.deleteForever')}
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setConfirmStartOver(false)}
          >
            {t('common.cancel')}
          </Button>
        </Box>
      ) : null}

      <Box ref={bodyRef} sx={bodyStyle}>
        {isLoading ? (
          <Typography variant="body2" sx={thinkingStyle}>
            {t('coach.loading')}
          </Typography>
        ) : null}

        {!isLoading && entries.length === 0 ? (
          <Box sx={examplesStyle}>
            <Typography variant="body2" sx={examplesTitleStyle}>
              {t('coach.examplesTitle')}
            </Typography>
            {EXAMPLE_QUESTIONS.map((key) => (
              <Button
                key={key}
                type="button"
                variant="outlined"
                disabled={busy || disabled}
                sx={exampleButtonStyle}
                onClick={() => onSend(t(`coach.examples.${key}`))}
              >
                {t(`coach.examples.${key}`)}
              </Button>
            ))}
          </Box>
        ) : null}

        {entries.length > 0 ? (
          <Box
            component="ol"
            role="log"
            aria-live="polite"
            aria-label={t('coach.conversation')}
            sx={logStyle}
          >
            {entries.map((entry) => (
              <CoachMessage
                key={entry.id}
                entry={entry}
                onAcceptProposal={onAcceptProposal}
              />
            ))}
            {isSending ? (
              <Typography component="li" variant="body2" sx={thinkingStyle}>
                {t('coach.thinking')}
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </Box>

      {error ? (
        <Box role="alert" sx={errorStyle}>
          <Typography variant="body2">{t(`coach.errors.${error}`)}</Typography>
          {disabled ? null : (
            <Button
              type="button"
              variant="outlined"
              disabled={busy}
              onClick={onRetry}
            >
              {t('common.tryAgain')}
            </Button>
          )}
        </Box>
      ) : null}

      <Box component="form" noValidate sx={composerStyle} onSubmit={submit}>
        <TextField
          label={t('coach.inputLabel')}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          multiline
          maxRows={6}
          size="small"
          fullWidth
          slotProps={{ htmlInput: { maxLength: MAX_MESSAGE_LENGTH } }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!canSend}
          sx={sendStyle}
        >
          {t('coach.send')}
        </Button>
      </Box>
      {/* One quiet line under the composer, where people read before sending. */}
      <Typography variant="body2" sx={noticeStyle}>
        <CircleInfoIcon />
        <span>
          {t('coach.aiNotice')}
          {retentionDays !== null
            ? ` ${t('coach.storageNotice', { count: retentionDays })}`
            : null}
        </span>
      </Typography>
    </Box>
  );
}

export { CoachChat };
