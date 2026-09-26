import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/app/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'A simple dashboard built with React, Node.js, Next.js, and TypeScript',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <InitColorSchemeScript defaultMode="system" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
