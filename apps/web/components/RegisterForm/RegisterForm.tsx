'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material';
import { ApiError } from '@repo/api-client';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

import {
  authErrorStyle,
  authFooterStyle,
  authFormStyle,
} from '@/components/AuthForm/AuthForm.style';
import { safeNextPath } from '@/lib/auth/safeNextPath';
import { registerField } from '@/lib/forms/registerField';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '@/lib/forms/schemas';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

export function RegisterForm() {
  const { t } = useTranslation();
  const { register: registerAccount, registerMutation } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema(t)),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function submit(values: RegisterFormValues) {
    clearErrors('root');
    try {
      await registerAccount(values);
      router.replace(safeNextPath(searchParams.get('next')));
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : t('common.error'),
      });
    }
  }

  return (
    <Box
      component="form"
      noValidate
      sx={authFormStyle}
      onSubmit={handleSubmit(submit)}
    >
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
      <TextField
        label={t('auth.password')}
        type="password"
        autoComplete="new-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message ?? t('auth.passwordHint')}
        fullWidth
        size="small"
        {...registerField(register('password'))}
      />
      {errors.root ? (
        <Alert severity="error" sx={authErrorStyle}>
          {errors.root.message}
        </Alert>
      ) : null}
      <Button
        type="submit"
        variant="contained"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending
          ? t('auth.creatingAccount')
          : t('auth.createAccount')}
      </Button>
      <Typography sx={authFooterStyle}>
        {t('auth.hasAccount')}{' '}
        <Link
          component={NextLink}
          href={`/login?next=${encodeURIComponent(safeNextPath(searchParams.get('next')))}`}
        >
          {t('auth.signIn')}
        </Link>
      </Typography>
    </Box>
  );
}
