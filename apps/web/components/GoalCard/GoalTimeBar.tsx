import { Box, LinearProgress, Typography } from '@mui/material';

import type { GoalColor } from '@/lib/goals/colors';

import {
  percentStyle,
  progressRowStyle,
  progressStyle,
  progressTrackStyle,
} from './GoalCard.style';

type GoalTimeBarProps = {
  percent: number;
  percentLabel: string;
  label: string;
  color: GoalColor;
};

function GoalTimeBar({
  percent,
  percentLabel,
  label,
  color,
}: GoalTimeBarProps) {
  return (
    <Box sx={progressRowStyle}>
      <Box sx={progressTrackStyle}>
        <LinearProgress
          variant="determinate"
          value={percent}
          aria-label={label}
          sx={progressStyle(color)}
        />
        <Typography variant="body2" component="span" sx={percentStyle(percent)}>
          {percentLabel}
        </Typography>
      </Box>
    </Box>
  );
}

export { GoalTimeBar };
