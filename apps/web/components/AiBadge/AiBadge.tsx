'use client';

import { Box } from '@mui/material';

import type { AiBadgeProps } from './AiBadge.interface';
import { badgeStyle } from './AiBadge.style';
import { useTranslation } from '@/lib/i18n';

/**
 * Marks a feature powered by AI. Hidden from screen readers: every place it
 * sits already says "AI" in its name or description.
 */
export function AiBadge({ sx }: AiBadgeProps) {
  const { t } = useTranslation();

  return (
    <Box
      component="span"
      aria-hidden
      sx={[badgeStyle, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {t('common.aiBadge')}
    </Box>
  );
}
