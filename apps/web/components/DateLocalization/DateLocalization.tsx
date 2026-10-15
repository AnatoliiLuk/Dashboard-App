'use client';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { ReactNode } from 'react';

import '@/lib/dates/dayjs';
import { pickerLocale } from '@/lib/dates/pickerLocale';
import { useTranslation } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/locale';

type DateLocalizationProps = {
  children: ReactNode;
};

function activeLocale(language: string | undefined): Locale {
  return language === 'uk' ? 'uk' : 'en';
}

export function DateLocalization({ children }: DateLocalizationProps) {
  const { i18n } = useTranslation();
  const locale = activeLocale(i18n.resolvedLanguage);
  const picker = pickerLocale(locale);

  return (
    <LocalizationProvider
      key={locale}
      dateAdapter={AdapterDayjs}
      adapterLocale={picker.adapterLocale}
      localeText={picker.localeText}
    >
      {children}
    </LocalizationProvider>
  );
}
