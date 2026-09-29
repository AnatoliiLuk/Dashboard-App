import { createInstance, type i18n } from 'i18next';

import { DEFAULT_LOCALE, LOCALES, type Locale } from './locale';
import { en } from './locales/en';
import { uk } from './locales/uk';

export function createI18n(locale: Locale, extend?: (instance: i18n) => void) {
  const instance = createInstance();
  extend?.(instance);
  void instance.init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...LOCALES],
    resources: {
      en: { translation: en },
      uk: { translation: uk },
    },
    interpolation: { escapeValue: false },
    returnNull: false,
    initAsync: false,
  });
  return instance;
}
