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
import { CircleInfoIcon } from '@/components/icons';
import { PageIntro } from '@/components/PageIntro';
import { useTranslation } from '@/lib/i18n';

import { EXAMPLE_QUESTIONS, MAX_MESSAGE_LENGTH } from './CoachChat.constants';
import type { CoachChatProps } from './CoachChat.interface';
import {
  composerStyle,
  errorStyle,
  exampleButtonStyle,
  examplesStyle,
  examplesTitleStyle,
  logStyle,
  noticeStyle,
  sendStyle,
  thinkingStyle,
} from './CoachChat.style';

function CoachChat({
  entries,
  isSending,
  error,
  onSend,
  onRetry,
  onAcceptProposal,
}: CoachChatProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const disabled = error === 'disabled';
  const canSend = !isSending && !disabled && draft.trim().length > 0;

  // Keep the newest message and the thinking line in view.
  useEffect(() => {
    if (entries.length) {
      endRef.current?.scrollIntoView?.({
        block: 'nearest',
        behavior: 'smooth',
      });
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
    <>
      <PageIntro description={t('coach.description')} />
      <Typography variant="body2" sx={noticeStyle}>
        <CircleInfoIcon />
        {t('coach.aiNotice')}
      </Typography>

      {entries.length === 0 ? (
        <Box sx={examplesStyle}>
          <Typography variant="body2" sx={examplesTitleStyle}>
            {t('coach.examplesTitle')}
          </Typography>
          {EXAMPLE_QUESTIONS.map((key) => (
            <Button
              key={key}
              type="button"
              variant="outlined"
              disabled={isSending || disabled}
              sx={exampleButtonStyle}
              onClick={() => onSend(t(`coach.examples.${key}`))}
            >
              {t(`coach.examples.${key}`)}
            </Button>
          ))}
        </Box>
      ) : (
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
      )}

      {error ? (
        <Box role="alert" sx={errorStyle}>
          <Typography variant="body2">{t(`coach.errors.${error}`)}</Typography>
          {disabled ? null : (
            <Button
              type="button"
              variant="outlined"
              disabled={isSending}
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
      <div ref={endRef} />
    </>
  );
}

export { CoachChat };
