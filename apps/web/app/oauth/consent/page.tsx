import type { Metadata } from 'next';

import { OAuthConsentView } from '@/components/OAuthConsentView';
import { requestI18n } from '@/lib/i18n/requestLocale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();

  return { title: i18n.t('oauth.title') };
}

export default function OAuthConsentPage() {
  return <OAuthConsentView />;
}
