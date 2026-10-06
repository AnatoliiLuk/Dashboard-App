import type { Metadata } from 'next';

import { AuthLayout } from '@/components/AuthLayout';
import { LoginForm } from '@/components/LoginForm';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();
  return { title: i18n.t('auth.signIn') };
}

export default async function LoginPage() {
  const i18n = await requestI18n();

  return (
    <AuthLayout title={i18n.t('auth.signIn')} lead={i18n.t('auth.loginLead')}>
      <LoginForm />
    </AuthLayout>
  );
}
