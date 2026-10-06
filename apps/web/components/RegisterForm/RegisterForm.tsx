'use client';

import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material';
import { ApiError } from '@repo/api-client';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  authErrorStyle,
  authFooterStyle,
  authFormStyle,
} from '@/components/AuthForm/AuthForm.style';
import { safeNextPath } from '@/lib/auth/safeNextPath';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

export function RegisterForm() {
  const { t } = useTranslation();
  const { register, registerMutation } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.replace(safeNextPath(searchParams.get('next')));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }
      setError(t('common.error'));
    }
  }

  return (
    <Box
      component="form"
      sx={authFormStyle}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <TextField
        label={t('auth.name')}
        name="name"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        fullWidth
        size="small"
      />
      <TextField
        label={t('auth.email')}
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        fullWidth
        size="small"
      />
      <TextField
        label={t('auth.password')}
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        fullWidth
        size="small"
        helperText={t('auth.passwordHint')}
      />
      {error ? (
        <Alert severity="error" sx={authErrorStyle}>
          {error}
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
