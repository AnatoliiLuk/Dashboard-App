'use client';

import { Box } from '@mui/material';
import type { i18n as I18n } from 'i18next';

import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALES,
  type Locale,
  useTranslation,
} from '@/lib/i18n';

import { localeLabel } from './LocaleSwitch.constants';
import {
  localeButtonActiveStyle,
  localeButtonStyle,
  localeGroupStyle,
} from './LocaleSwitch.style';

function applyLocale(locale: Locale, i18n: I18n) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
  document.documentElement.lang = locale;
  void i18n.changeLanguage(locale);
}

function LocaleSwitch() {
  const { t, i18n } = useTranslation();
  const active = i18n.resolvedLanguage === 'uk' ? 'uk' : 'en';

  return (
    <Box role="group" aria-label={t('locale.label')} sx={localeGroupStyle}>
      {LOCALES.map((locale) => (
        <Box
          key={locale}
          component="button"
          type="button"
          aria-pressed={active === locale}
          onClick={() => applyLocale(locale, i18n)}
          sx={[
            localeButtonStyle,
            active === locale ? localeButtonActiveStyle : null,
          ]}
        >
          {t(localeLabel[locale])}
        </Box>
      ))}
    </Box>
  );
}

export { LocaleSwitch };
