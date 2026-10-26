import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const noticeStyle = ({ vars, spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: spacingPx[8],
  mb: spacingPx[24],
  color: vars.palette.text.secondary,
  '& svg': {
    flexShrink: 0,
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
  mb: spacingPx[24],
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
