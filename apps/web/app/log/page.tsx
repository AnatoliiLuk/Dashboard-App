import type { Metadata } from 'next';

import { LogView } from '@/components/LogView';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();

  return { title: i18n.t('shell.logHabits') };
}

export default function LogPage() {
  return <LogView />;
}
