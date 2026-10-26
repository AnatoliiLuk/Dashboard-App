import type { Metadata } from 'next';

import { CoachView } from '@/components/CoachView';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();

  return { title: i18n.t('shell.coach') };
}

export default function CoachPage() {
  return <CoachView />;
}
