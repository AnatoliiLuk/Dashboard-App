import { enUS, ukUA } from '@mui/x-date-pickers/locales';

import type { Locale } from '@/lib/i18n/locale';

const localeText = {
  en: enUS.components.MuiLocalizationProvider.defaultProps.localeText,
  uk: ukUA.components.MuiLocalizationProvider.defaultProps.localeText,
} as const;

export function pickerLocale(locale: Locale) {
  return {
    adapterLocale: locale,
    localeText: localeText[locale],
  };
}
