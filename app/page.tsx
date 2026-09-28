import type { Metadata } from 'next';

import { HomeView } from '@/components/HomeView';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();

  return {
    title: {
      absolute: `${i18n.t('shell.calendar')} · ${i18n.t('shell.brand')}`,
    },
  };
}

export default function Home() {
  return <HomeView />;
}
