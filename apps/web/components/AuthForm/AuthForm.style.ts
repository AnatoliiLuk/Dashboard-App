import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const authPageStyle = ({ vars, spacingPx }: Theme) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: vars.palette.background.default,
  color: vars.palette.text.primary,
  px: spacingPx[24],
  py: spacingPx[48],
});

export const authMainStyle = () => ({
  width: '100%',
  maxWidth: '24rem',
});

export const authHeaderStyle = ({ spacingPx }: Theme) => ({
  mb: spacingPx[32],
});

export const authBrandStyle = ({ spacingPx }: Theme) => ({
  m: spacingPx[0],
  mb: spacingPx[8],
});

export const authLeadStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const authFormStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[16],
});

export const authFooterStyle = ({ vars, spacingPx }: Theme) => ({
  mt: spacingPx[24],
  color: vars.palette.text.secondary,
});

export const authErrorStyle = ({ vars }: Theme) => ({
  color: vars.palette.error.main,
});
