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
import { loginFormSchema, type LoginFormValues } from '@/lib/forms/schemas';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

export function LoginForm() {
  const { t } = useTranslation();
  const { login, loginMutation } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema(t)),
    defaultValues: { email: '', password: '' },
  });

  async function submit(values: LoginFormValues) {
    clearErrors('root');
    try {
      await login(values);
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
        autoComplete="current-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
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
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? t('auth.signingIn') : t('auth.signIn')}
      </Button>
      <Typography sx={authFooterStyle}>
        {t('auth.noAccount')}{' '}
        <Link
          component={NextLink}
          href={`/register?next=${encodeURIComponent(safeNextPath(searchParams.get('next')))}`}
        >
          {t('auth.register')}
        </Link>
      </Typography>
    </Box>
  );
}
