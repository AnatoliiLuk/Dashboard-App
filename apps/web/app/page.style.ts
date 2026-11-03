import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const loadingStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});
