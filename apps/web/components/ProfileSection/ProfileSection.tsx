'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { ApiError } from '@repo/api-client';
import type { UpdateProfileDto } from '@repo/types';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import type { ProfileFormProps } from './ProfileSection.interface';
import {
  actionsStyle,
  memberSinceStyle,
  sectionStyle,
} from './ProfileSection.style';
import { dayjs } from '@/lib/dates/dayjs';
import { registerField } from '@/lib/forms/registerField';
import { profileFormSchema, type ProfileFormValues } from '@/lib/forms/schemas';
import { formatDisplay } from '@/lib/habits/dates';
import { useUpdateProfile } from '@/lib/hooks/useAccount';
import { useAuth } from '@/lib/hooks/useAuth';
import { displayLocale, useTranslation } from '@/lib/i18n';

// The API's message for a wrong password; it is a 400 so the client stays
// signed in, which means the status alone cannot tell it apart.
const WRONG_PASSWORD = 'Current password is incorrect';

export function ProfileSection() {
  const { user } = useAuth();

  return user ? <ProfileForm user={user} /> : null;
}

function ProfileForm({ user }: ProfileFormProps) {
  const { t, i18n } = useTranslation();
  const locale = displayLocale(i18n.resolvedLanguage ?? i18n.language);
  const update = useUpdateProfile();
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema(t, user.email)),
    defaultValues: { name: user.name, email: user.email, currentPassword: '' },
  });

  const email = useWatch({ control, name: 'email' });
  const emailChanged = email.trim().toLowerCase() !== user.email;

  async function submit(values: ProfileFormValues) {
    clearErrors('root');
    setSaved(false);

    const dto: UpdateProfileDto = {};
    if (values.name !== user.name) {
      dto.name = values.name;
    }
    if (values.email !== user.email) {
      dto.email = values.email;
      dto.currentPassword = values.currentPassword;
    }

    try {
      if (Object.keys(dto).length > 0) {
        await update.mutateAsync(dto);
      }
      reset({ name: values.name, email: values.email, currentPassword: '' });
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('email', { message: t('account.profile.emailInUse') });
      } else if (err instanceof ApiError && err.status === 429) {
        setError('root', { message: t('account.profile.tooManyAttempts') });
      } else if (err instanceof ApiError && err.message === WRONG_PASSWORD) {
        setError('currentPassword', {
          message: t('account.profile.passwordIncorrect'),
        });
      } else {
        setError('root', {
          message: err instanceof ApiError ? err.message : t('common.error'),
        });
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
        {t('account.profile.title')}
      </Typography>
      <Typography variant="body2" sx={memberSinceStyle}>
        {t('account.profile.memberSince', {
          date: formatDisplay(
            dayjs(user.createdAt).format('YYYY-MM-DD'),
            locale,
          ),
        })}
      </Typography>
      <TextField
        label={t('auth.name')}
        autoComplete="name"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        fullWidth
        size="small"
        {...registerField(register('name'))}
      />
      <TextField
        label={t('auth.email')}
        type="email"
        autoComplete="email"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        fullWidth
        size="small"
        {...registerField(register('email'))}
      />
      {emailChanged ? (
        <TextField
          label={t('account.profile.currentPassword')}
          type="password"
          autoComplete="current-password"
          error={Boolean(errors.currentPassword)}
          helperText={
            errors.currentPassword?.message ??
            t('account.profile.currentPasswordHint')
          }
          fullWidth
          size="small"
          {...registerField(register('currentPassword'))}
        />
      ) : null}
      {errors.root ? (
        <Alert severity="error">{errors.root.message}</Alert>
      ) : null}
      <Box sx={actionsStyle}>
        <Button type="submit" variant="contained" disabled={update.isPending}>
          {update.isPending ? t('account.profile.saving') : t('common.save')}
        </Button>
        {saved ? (
          <Typography role="status" variant="body2">
            {t('account.profile.saved')}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
