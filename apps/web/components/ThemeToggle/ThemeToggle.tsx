'use client';

import { Box } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import { MonitorIcon, MoonIcon, SunIcon } from '@/components/icons';
import { useTranslation } from '@/lib/i18n';

import {
  buttonActiveStyle,
  buttonStyle,
  groupStyle,
} from './ThemeToggle.style';

const themeModes = ['light', 'system', 'dark'] as const;

const themeIcon = {
  light: SunIcon,
  system: MonitorIcon,
  dark: MoonIcon,
} as const;

const themeLabel = {
  light: 'theme.light',
  system: 'theme.system',
  dark: 'theme.dark',
} as const;

function ThemeToggle() {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();

  return (
    <Box role="group" aria-label={t('theme.label')} sx={groupStyle}>
      {themeModes.map((option) => {
        const Icon = themeIcon[option];
        const selected = mode === option;

        return (
          <Box
            key={option}
            component="button"
            type="button"
            aria-pressed={selected}
            aria-label={t(themeLabel[option])}
            onClick={() => setMode(option)}
            sx={[buttonStyle, selected ? buttonActiveStyle : null]}
          >
            <Icon width={16} height={16} />
          </Box>
        );
      })}
    </Box>
  );
}

export { ThemeToggle };
