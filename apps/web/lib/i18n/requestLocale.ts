import { cookies, headers } from 'next/headers';

import { createI18n } from './createI18n';
import { isLocale, LOCALE_COOKIE, localeFromAcceptLanguage } from './locale';

export async function requestLocale() {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(stored)) return stored;

  const headerStore = await headers();
  return localeFromAcceptLanguage(headerStore.get('accept-language'));
}

export async function requestI18n() {
  return createI18n(await requestLocale());
}
