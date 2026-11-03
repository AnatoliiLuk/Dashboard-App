import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const contentStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[24],
});

export const listStyle = ({ spacingPx }: Theme) => ({
  m: spacingPx[0],
  p: spacingPx[0],
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[16],
});

export const rowStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[8],
});

export const nameStyle = () => ({
  fontWeight: 600,
  overflowWrap: 'anywhere',
});

export const secondaryTextStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: spacingPx[8],
});

// A callout, so people notice they can use Habits+ from Claude Code.
export const setupStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[8],
  p: spacingPx[16],
  border: border[1],
  borderColor: vars.palette.divider,
  borderRadius: borderRadius.sm,
  backgroundColor: vars.palette.background.default,
});

export const setupTitleRowStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: spacingPx[8],
});

export const setupTitleStyle = ({ spacingPx }: Theme) => ({
  m: spacingPx[0],
});

export const commandRowStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: spacingPx[8],
});

// One line that scrolls, so the command is never broken where it would be copied.
export const commandStyle = ({ vars, spacingPx, borderRadius }: Theme) => ({
  flex: 1,
  minWidth: 0,
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  px: spacingPx[12],
  py: spacingPx[8],
  borderRadius: borderRadius.xs,
  backgroundColor: vars.palette.action.hover,
  fontFamily: 'var(--font-geist-mono), monospace',
  fontSize: '0.8125rem',
});
