import type { Metadata } from 'next';

import { AuthLayout } from '@/components/AuthLayout';
import { RegisterForm } from '@/components/RegisterForm';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();
  return { title: i18n.t('auth.register') };
}

export default async function RegisterPage() {
  const i18n = await requestI18n();

  return (
    <AuthLayout
      title={i18n.t('auth.createAccount')}
      lead={i18n.t('auth.registerLead')}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
