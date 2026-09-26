'use client';

import { Box } from '@mui/material';

import {
  LOCALE_COOKIE,
  LOCALES,
  type Locale,
  useTranslation,
} from '@/lib/i18n';

import {
  localeButtonActiveStyle,
  localeButtonStyle,
  localeGroupStyle,
} from './LocaleSwitch.style';

const localeLabel = {
  en: 'locale.en',
  uk: 'locale.uk',
} as const;

function LocaleSwitch() {
  const { t, i18n } = useTranslation();
  const active = i18n.resolvedLanguage === 'uk' ? 'uk' : 'en';

  function choose(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = locale;
    void i18n.changeLanguage(locale);
  }

  return (
    <Box role="group" aria-label={t('locale.label')} sx={localeGroupStyle}>
      {LOCALES.map((locale) => (
        <Box
          key={locale}
          component="button"
          type="button"
          aria-pressed={active === locale}
          onClick={() => choose(locale)}
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
