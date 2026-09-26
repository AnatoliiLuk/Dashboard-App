'use client';

import { Box } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import { MoonIcon, SunIcon } from '@/components/icons';

import { getThemeToggleState } from './ThemeToggle.helpers';
import { iconStyle, themeToggleStyle, thumbStyle } from './ThemeToggle.style';

function ThemeToggle() {
  const { mode, setMode, systemMode } = useColorScheme();
  const { isDark, label, nextMode } = getThemeToggleState(mode, systemMode);

  return (
    <Box
      component="button"
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      onClick={() => {
        if (isDark === undefined) {
          return;
        }
        setMode(nextMode);
      }}
      sx={themeToggleStyle}
    >
      <Box sx={thumbStyle} />
      <Box sx={iconStyle(false)}>
        <SunIcon />
      </Box>
      <Box sx={iconStyle(true)}>
        <MoonIcon />
      </Box>
    </Box>
  );
}

export { ThemeToggle };
