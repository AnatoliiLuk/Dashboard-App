import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const fieldStyle = {
  width: '100%',
  minWidth: 0,
};

export const optionStyle = ({ spacingPx }: Theme) => ({
  minWidth: spacingPx[44],
  minHeight: spacingPx[44],
});

export const valueStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: spacingPx[8],
  minWidth: 0,
});

export const swatchStyle =
  (background: string) =>
  ({ spacingPx, borderRadius }: Theme) => ({
    width: spacingPx[16],
    height: spacingPx[16],
    flexShrink: 0,
    borderRadius: borderRadius.pill,
    backgroundColor: background,
  });
