'use client';

import { Box, Button, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { actionStyle, headerStyle, titleStyle } from './PageHeader.style';

type PageHeaderProps = {
  title: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  actionDisabled?: boolean;
  onAction?: () => void;
};

export function PageHeader({
  title,
  actionLabel,
  actionIcon,
  actionDisabled,
  onAction,
}: PageHeaderProps) {
  return (
    <Box sx={headerStyle}>
      <Typography component="h1" sx={titleStyle}>
        {title}
      </Typography>
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
