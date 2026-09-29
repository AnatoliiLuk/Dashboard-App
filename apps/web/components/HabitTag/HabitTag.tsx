import { Box } from '@mui/material';

import type { HabitColor } from '@/lib/habits/colors';

import { habitTagStyle } from './HabitTag.style';

type HabitTagProps = {
  name: string;
  color: HabitColor;
};

function HabitTag({ name, color }: HabitTagProps) {
  return (
    <Box component="span" title={name} sx={habitTagStyle(color)}>
      {name}
    </Box>
  );
}

export { HabitTag };
