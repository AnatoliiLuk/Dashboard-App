import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

// Fills the height AppShell leaves; header and composer stay, the body scrolls.
export const rootStyle = () => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
});

export const bodyStyle = ({ spacingPx }: Theme) => ({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  mb: spacingPx[16],
});

export const noticeStyle = ({ vars, spacingPx, typography }: Theme) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: spacingPx[8],
  mt: spacingPx[12],
  color: vars.palette.text.secondary,
  fontSize: typography.pxToRem(12),
  '& svg': {
    flexShrink: 0,
    mt: spacingPx[2],
  },
});

export const examplesStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: spacingPx[8],
  mb: spacingPx[24],
});

export const examplesTitleStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const exampleButtonStyle = () => ({
  height: 'auto',
  textAlign: 'left' as const,
  whiteSpace: 'normal' as const,
});

export const logStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[16],
  listStyle: 'none',
  m: spacingPx[0],
  p: spacingPx[0],
});

export const thinkingStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const errorStyle = ({ vars, spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: spacingPx[12],
  mb: spacingPx[24],
  color: vars.palette.error.main,
});

export const composerStyle = ({ spacingPx, breakpoints }: Theme) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: spacingPx[8],
  [breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

export const sendStyle = () => ({
  flexShrink: 0,
});

export const startOverStyle = ({ vars, spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: spacingPx[8],
  mb: spacingPx[16],
  color: vars.palette.text.secondary,
});
