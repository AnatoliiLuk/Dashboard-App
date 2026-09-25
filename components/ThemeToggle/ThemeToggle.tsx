'use client';

import { Box } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import { getThemeToggleState } from './ThemeToggle.helpers';
import { themeToggleStyle } from './ThemeToggle.style';

function ThemeToggle() {
  const { mode, setMode, systemMode } = useColorScheme();
  const { label, nextMode } = getThemeToggleState(mode, systemMode);

  return (
    <Box
      component="button"
      type="button"
      onClick={() => setMode(nextMode)}
      sx={themeToggleStyle}
    >
      {label}
    </Box>
  );
}

export { ThemeToggle };
