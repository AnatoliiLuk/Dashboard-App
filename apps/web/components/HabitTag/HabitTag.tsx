import { Box } from '@mui/material';

import type { HabitColor } from '@/lib/habits/colors';

import { habitTagStyle } from './HabitTag.style';

type HabitTagProps = {
  name: string;
  color: HabitColor;
  wrap?: boolean;
};

function HabitTag({ name, color, wrap = false }: HabitTagProps) {
  return (
    <Box component="span" title={name} sx={habitTagStyle(color, wrap)}>
      {name}
    </Box>
  );
}

export { HabitTag };
