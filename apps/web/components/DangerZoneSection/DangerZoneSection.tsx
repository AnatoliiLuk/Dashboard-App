'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { ApiError } from '@repo/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { contentStyle, dialogContentStyle } from './DangerZoneSection.style';
import { AccountSection } from '@/components/AccountSection';
import { registerField } from '@/lib/forms/registerField';
import {
  deleteAccountFormSchema,
  type DeleteAccountFormValues,
} from '@/lib/forms/schemas';
import { useDeleteAccount } from '@/lib/hooks/useAccount';
import { useTranslation } from '@/lib/i18n';

export function DangerZoneSection() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <AccountSection
      title={t('account.danger.title')}
      description={t('account.danger.description')}
      tone="danger"
    >
      <Box sx={contentStyle}>
        <Button
          type="button"
          variant="outlined"
          color="error"
          onClick={() => setOpen(true)}
        >
          {t('account.danger.delete')}
        </Button>
        {open ? <DeleteAccountDialog onClose={() => setOpen(false)} /> : null}
      </Box>
    </AccountSection>
  );
}

// Mounted only while open, so the password never outlives the dialog.
function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const remove = useDeleteAccount();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountFormSchema(t)),
    defaultValues: { password: '' },
  });

  async function submit(values: DeleteAccountFormValues) {
    clearErrors('root');

    try {
      await remove.mutateAsync({ password: values.password });
      router.replace('/login');
    } catch (err) {
      // Map on the API's error code, never on its English message.
      const code = err instanceof ApiError ? err.code : undefined;
      if (code === 'CURRENT_PASSWORD_INCORRECT') {
        setError('password', {
          message: t('account.danger.passwordIncorrect'),
        });
      } else if (code === 'RATE_LIMITED') {
        setError('root', { message: t('account.danger.tooManyAttempts') });
      } else {
        setError('root', { message: t('common.error') });
      }
    }
  }

  return (
    <Dialog
      open
      onClose={remove.isPending ? undefined : onClose}
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-body"
      fullWidth
      maxWidth="xs"
    >
      <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
        <DialogTitle id="delete-account-title">
          {t('account.danger.dialogTitle')}
        </DialogTitle>
        <DialogContent sx={dialogContentStyle}>
          <Typography id="delete-account-body" variant="body2">
            {t('account.danger.dialogBody')}
          </Typography>
          <TextField
            label={t('account.danger.password')}
            type="password"
            autoComplete="current-password"
            autoFocus
            error={Boolean(errors.password)}
            helperText={
              errors.password?.message ?? t('account.danger.passwordHint')
            }
            fullWidth
            size="small"
            {...registerField(register('password'))}
          />
          {errors.root ? (
            <Alert severity="error">{errors.root.message}</Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            disabled={remove.isPending}
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={remove.isPending}
          >
            {remove.isPending
              ? t('account.danger.deleting')
              : t('common.deleteForever')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
