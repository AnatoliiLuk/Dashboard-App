import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { Geist, Geist_Mono } from 'next/font/google';

import { Providers } from '@/app/providers';
import { requestI18n, requestLocale } from '@/lib/i18n/requestLocale';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await requestI18n();

  return {
    title: {
      default: i18n.t('meta.title'),
      template: `%s · ${i18n.t('shell.brand')}`,
    },
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
