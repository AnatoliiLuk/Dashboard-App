import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const fieldStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  minWidth: 0,
  minHeight: spacingPx[40],
  gap: spacingPx[16],
});

export const labelStyle =
  (disabled: boolean) =>
  ({ vars, typography }: Theme) => ({
    flexShrink: 0,
    color: disabled ? vars.palette.text.disabled : vars.palette.text.secondary,
    fontFamily: typography.body2.fontFamily,
    fontSize: typography.body2.fontSize,
    lineHeight: typography.body2.lineHeight,
  });

export const colorPickerStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flex: '1 1 auto',
  flexWrap: 'wrap',
  minWidth: 0,
  gap: spacingPx[4],
});

export const colorSwatchStyle =
  (background: string, selected: boolean) =>
  ({ vars, spacingPx, border, borderRadius, pxToRem }: Theme) => ({
    width: spacingPx[24],
    height: spacingPx[24],
    minWidth: spacingPx[24],
    m: spacingPx[0],
    p: spacingPx[0],
    border: border[2],
    borderColor: 'transparent',
    borderRadius: borderRadius.pill,
    backgroundColor: background,
    cursor: 'pointer',
    boxShadow: selected
      ? `0 0 0 ${pxToRem(2)} ${vars.palette.background.paper}, 0 0 0 ${pxToRem(4)} ${vars.palette.text.primary}`
      : 'none',
    '&:disabled': {
      cursor: 'default',
      opacity: 0.5,
    },
  });
