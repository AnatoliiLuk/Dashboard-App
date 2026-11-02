'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { ApiError } from '@repo/api-client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { actionsStyle, sectionStyle } from './SecuritySection.style';
import { registerField } from '@/lib/forms/registerField';
import {
  securityFormSchema,
  type SecurityFormValues,
} from '@/lib/forms/schemas';
import { useChangePassword } from '@/lib/hooks/useAccount';
import { useTranslation } from '@/lib/i18n';

const EMPTY: SecurityFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function SecuritySection() {
  const { t } = useTranslation();
  const change = useChangePassword();
  const [changed, setChanged] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isDirty },
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema(t)),
    defaultValues: EMPTY,
  });

  async function submit(values: SecurityFormValues) {
    clearErrors('root');
    setChanged(false);

    try {
      await change.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset(EMPTY);
      setChanged(true);
    } catch (err) {
      // Map on the API's error code, never on its English message (#15, #16).
      const code = err instanceof ApiError ? err.code : undefined;
      if (code === 'CURRENT_PASSWORD_INCORRECT') {
        setError('currentPassword', {
          message: t('account.security.passwordIncorrect'),
        });
      } else if (code === 'PASSWORD_UNCHANGED') {
        setError('newPassword', { message: t('validation.passwordSame') });
      } else if (code === 'RATE_LIMITED') {
        setError('root', { message: t('account.security.tooManyAttempts') });
      } else {
        setError('root', { message: t('common.error') });
      }
    }
  }

  return (
    <Box
      component="form"
      noValidate
      sx={sectionStyle}
      onSubmit={handleSubmit(submit)}
    >
      <Typography variant="h6" component="h2">
        {t('account.security.title')}
      </Typography>
      <TextField
        label={t('account.security.currentPassword')}
        type="password"
        autoComplete="current-password"
        error={Boolean(errors.currentPassword)}
        helperText={errors.currentPassword?.message}
        fullWidth
        size="small"
        {...registerField(register('currentPassword'))}
      />
      <TextField
        label={t('account.security.newPassword')}
        type="password"
        autoComplete="new-password"
        error={Boolean(errors.newPassword)}
        helperText={
          errors.newPassword?.message ?? t('account.security.newPasswordHint')
        }
        fullWidth
        size="small"
        {...registerField(register('newPassword'))}
      />
      <TextField
        label={t('account.security.confirmPassword')}
        type="password"
        autoComplete="new-password"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
        fullWidth
        size="small"
        {...registerField(register('confirmPassword'))}
      />
      {errors.root ? (
        <Alert severity="error">{errors.root.message}</Alert>
      ) : null}
      <Box sx={actionsStyle}>
        <Button type="submit" variant="contained" disabled={change.isPending}>
          {change.isPending
            ? t('account.security.submitting')
            : t('account.security.submit')}
        </Button>
        {/* Hidden again as soon as the user types, so it never sits next to unsaved input (#17). */}
        {changed && !isDirty ? (
          <Typography role="status" variant="body2">
            {t('account.security.changed')}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
