'use client';

import { Box, Button, Typography } from '@mui/material';

import { actionStyle, descriptionStyle, introStyle } from './PageIntro.style';

type PageIntroProps = {
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function PageIntro({
  description,
  actionLabel,
  onAction,
}: PageIntroProps) {
  return (
    <Box sx={introStyle}>
      <Typography sx={descriptionStyle}>{description}</Typography>
      {actionLabel && onAction ? (
        <Button variant="contained" sx={actionStyle} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}
