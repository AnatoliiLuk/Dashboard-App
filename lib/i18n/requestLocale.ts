import { cookies } from 'next/headers';

import { createI18n } from './createI18n';
import { LOCALE_COOKIE, parseLocale } from './locale';

export async function requestLocale() {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}

export async function requestI18n() {
  return createI18n(await requestLocale());
}
