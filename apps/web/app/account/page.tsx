import type { Metadata } from 'next';

import { AccountView } from '@/components/AccountView';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();

  return { title: i18n.t('shell.account') };
}

export default function AccountPage() {
  return <AccountView />;
}
