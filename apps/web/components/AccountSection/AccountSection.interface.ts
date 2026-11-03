import type { ReactNode } from 'react';

export interface AccountSectionProps {
  title: string;
  description: string;
  /** Shown next to the title, outside the heading, such as `<AiBadge />`. */
  badge?: ReactNode;
  /** `danger` draws the card with an error-coloured border. */
  tone?: 'default' | 'danger';
  children: ReactNode;
}
