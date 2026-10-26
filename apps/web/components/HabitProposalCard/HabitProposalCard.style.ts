import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const cardStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacingPx[12],
  mt: spacingPx[12],
  p: spacingPx[16],
  border: border[1],
  borderColor: vars.palette.divider,
  borderRadius: borderRadius.md,
  backgroundColor: vars.palette.background.paper,
});

export const labelStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: spacingPx[8],
});

export const statusStyle =
  (failed: boolean) =>
  ({ vars }: Theme) => ({
    color: failed ? vars.palette.error.main : vars.palette.success.main,
  });
