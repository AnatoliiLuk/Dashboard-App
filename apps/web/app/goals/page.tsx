import type { Metadata } from 'next';

import { GoalsView } from '@/components/GoalsView';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();

  return { title: i18n.t('shell.myGoals') };
}

export default function GoalsPage() {
  return <GoalsView />;
}
