import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

/** Thumb size inside a 40px control (minus 1px borders and 4px inset). */
const thumbSize = ({ spacingPx }: Theme) =>
  `calc(${spacingPx[40]} - 2px - ${spacingPx[4]} * 2)`;

const endSlot = (theme: Theme) =>
  `calc(${theme.spacingPx[4]} + ${thumbSize(theme)} + ${theme.spacingPx[4]})`;

export const themeToggleStyle = (theme: Theme) => {
  const { vars, spacingPx, border, borderRadius } = theme;
  const size = thumbSize(theme);

  return {
    position: 'relative' as const,
    display: 'block' as const,
    flexShrink: 0,
    boxSizing: 'border-box' as const,
    width: `calc(${size} * 2 + ${spacingPx[4]} * 3)`,
    height: spacingPx[40],
    m: spacingPx[0],
    p: spacingPx[0],
    border: border[1],
    borderColor: vars.palette.divider,
    backgroundColor: vars.palette.background.paper,
    borderRadius: borderRadius.pill,
    cursor: 'pointer' as const,
    '&:focus-visible': {
      outline: `${border[2]} ${vars.palette.text.primary}`,
      outlineOffset: spacingPx[4],
    },
  };
};

export const thumbStyle = (theme: Theme) => {
  const { vars, spacingPx, borderRadius, getColorSchemeSelector } = theme;
  const size = thumbSize(theme);

  return {
    position: 'absolute',
    top: spacingPx[4],
    left: spacingPx[4],
    width: size,
    height: size,
    borderRadius: borderRadius.pill,
    backgroundColor: vars.palette.text.primary,
    transition: 'left 160ms ease',
    [getColorSchemeSelector('dark')]: {
      left: endSlot(theme),
    },
  };
};

export const iconStyle = (atEnd: boolean) => (theme: Theme) => {
  const { vars, spacingPx, getColorSchemeSelector } = theme;
  const size = thumbSize(theme);

  return {
    position: 'absolute',
    top: spacingPx[4],
    left: atEnd ? endSlot(theme) : spacingPx[4],
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    fontSize: spacingPx[16],
    color: atEnd ? vars.palette.text.secondary : vars.palette.background.paper,
    '& svg': {
      display: 'block',
    },
    [getColorSchemeSelector('dark')]: {
      color: atEnd
        ? vars.palette.background.paper
        : vars.palette.text.secondary,
    },
  };
};
