import type { Metadata } from 'next';

import { AccountSecurityView } from '@/components/AccountSecurityView';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();

  return { title: i18n.t('account.nav.security') };
}

export default function AccountSecurityPage() {
  return <AccountSecurityView />;
}
