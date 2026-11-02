'use client';

import { Box, Typography } from '@mui/material';
import { useId } from 'react';

import type { AccountSectionProps } from './AccountSection.interface';
import {
  cardStyle,
  controlsStyle,
  dangerCardStyle,
  descriptionStyle,
  introStyle,
  titleStyle,
} from './AccountSection.style';

/** A settings row: title and explanation on the left, controls on the right. */
export function AccountSection({
  title,
  description,
  tone = 'default',
  children,
}: AccountSectionProps) {
  const titleId = useId();

  return (
    <Box
      component="section"
      aria-labelledby={titleId}
      sx={[cardStyle, tone === 'danger' ? dangerCardStyle : null]}
    >
      <Box sx={introStyle}>
        <Typography id={titleId} variant="h6" component="h2" sx={titleStyle}>
          {title}
        </Typography>
        <Typography variant="body2" sx={descriptionStyle}>
          {description}
        </Typography>
      </Box>
      <Box sx={controlsStyle}>{children}</Box>
    </Box>
  );
}
