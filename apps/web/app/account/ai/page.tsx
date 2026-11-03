import type { Metadata } from 'next';

import { AccountAiView } from '@/components/AccountAiView';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();

  return { title: i18n.t('account.nav.ai') };
}

export default function AccountAiPage() {
  return <AccountAiView />;
}
