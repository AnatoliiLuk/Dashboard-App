import { ThemeProvider } from '@mui/material/styles';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import { theme } from '@/app/theme';
import { createI18n } from '@/lib/i18n/createI18n';
import type { Locale } from '@/lib/i18n/locale';

function Wrapper({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const i18n = createI18n(locale, (instance) => {
    instance.use(initReactI18next);
  });

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme} defaultMode="light">
        {children}
      </ThemeProvider>
    </I18nextProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  { locale = 'en', ...options }: RenderOptions & { locale?: Locale } = {},
) {
  return render(ui, {
    ...options,
    wrapper: ({ children }) => <Wrapper locale={locale}>{children}</Wrapper>,
  });
}
