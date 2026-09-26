import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const pageStyle = ({ vars, spacingPx }: Theme) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: vars.palette.background.default,
  color: vars.palette.text.primary,
  px: spacingPx[24],
  py: spacingPx[48],
});

export const mainStyle = () => ({
  width: '100%',
  maxWidth: '60rem',
});

export const headerStyle = ({ spacingPx }: Theme) => ({
  mb: spacingPx[32],
});

export const headerTopStyle = () => ({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const titleStyle = ({ spacingPx }: Theme) => ({
  mt: spacingPx[8],
});

export const descriptionStyle = ({ vars, spacingPx }: Theme) => ({
  mt: spacingPx[8],
  maxWidth: spacingPx[576],
  color: vars.palette.text.secondary,
});

export const loadingStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const navStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  gap: spacingPx[16],
  mt: spacingPx[16],
});

export const navLinkStyle = ({ vars, typography }: Theme) => ({
  color: vars.palette.text.primary,
  fontSize: typography.body2.fontSize,
  fontWeight: typography.fontWeightMedium,
});
