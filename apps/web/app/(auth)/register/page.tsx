import type { Metadata } from 'next';

import { AuthLayout } from '@/components/AuthLayout';
import { RegisterForm } from '@/components/RegisterForm';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();
  return { title: i18n.t('auth.register') };
}

export default function RegisterPage() {
  return (
    <AuthLayout titleKey="auth.createAccount" leadKey="auth.registerLead">
      <RegisterForm />
    </AuthLayout>
  );
}
