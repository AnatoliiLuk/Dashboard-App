'use client';

import { Box, Button, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import {
  actionStyle,
  headerStyle,
  titleRowStyle,
  titleStyle,
} from './PageHeader.style';

type PageHeaderProps = {
  title: string;
  /** Shown next to the title, outside the heading, such as `<AiBadge />`. */
  badge?: ReactNode;
  actionLabel?: string;
  actionIcon?: ReactNode;
  actionDisabled?: boolean;
  onAction?: () => void;
};

export function PageHeader({
  title,
  badge,
  actionLabel,
  actionIcon,
  actionDisabled,
  onAction,
}: PageHeaderProps) {
  return (
    <Box sx={headerStyle}>
      <Box sx={titleRowStyle}>
        <Typography component="h1" sx={titleStyle}>
          {title}
        </Typography>
        {badge}
      </Box>
      {actionLabel && onAction ? (
        <Button
          variant="contained"
          startIcon={actionIcon}
          disabled={actionDisabled}
          sx={actionStyle}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}
