'use client';

import { Box } from '@mui/material';

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

function LocaleSwitch() {
  const { t, i18n } = useTranslation();
  const active = i18n.resolvedLanguage === 'uk' ? 'uk' : 'en';

  function choose(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
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
