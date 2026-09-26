import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';

import { Providers } from '@/app/providers';
import { createI18n } from '@/lib/i18n/createI18n';
import { LOCALE_COOKIE, parseLocale } from '@/lib/i18n/locale';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

async function requestLocale() {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  const i18n = createI18n(locale);

  return {
    title: i18n.t('meta.title'),
    description: i18n.t('meta.description'),
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await requestLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <InitColorSchemeScript defaultMode="system" />
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
