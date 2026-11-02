import type { ReactNode } from 'react';

export interface AccountSectionProps {
  title: string;
  description: string;
  /** `danger` draws the card with an error-coloured border. */
  tone?: 'default' | 'danger';
  children: ReactNode;
}
