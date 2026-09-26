import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const colorPickerStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: spacingPx[8],
});

export const colorSwatchStyle =
  (background: string, selected: boolean) =>
  ({ vars, spacingPx, border, borderRadius }: Theme) => ({
    width: spacingPx[24],
    height: spacingPx[24],
    minWidth: spacingPx[24],
    m: spacingPx[0],
    p: spacingPx[0],
    border: border[2],
    borderColor: selected ? vars.palette.text.primary : 'transparent',
    borderRadius: borderRadius.pill,
    backgroundColor: background,
    cursor: 'pointer',
  });
