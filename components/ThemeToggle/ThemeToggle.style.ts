import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

const endSlot = ({ spacingPx }: Theme) =>
  `calc(${spacingPx[4]} + ${spacingPx[24]} + ${spacingPx[4]})`;

export const themeToggleStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  position: 'relative',
  display: 'block',
  flexShrink: 0,
  boxSizing: 'content-box',
  width: `calc(${spacingPx[24]} * 2 + ${spacingPx[4]} * 3)`,
  height: `calc(${spacingPx[24]} + ${spacingPx[4]} * 2)`,
  m: spacingPx[0],
  p: spacingPx[0],
  border: border[1],
  borderColor: vars.palette.divider,
  backgroundColor: vars.palette.background.paper,
  borderRadius: borderRadius.pill,
  cursor: 'pointer',
  '&:focus-visible': {
    outline: `${border[2]} ${vars.palette.text.primary}`,
    outlineOffset: spacingPx[4],
  },
});

export const thumbStyle = (theme: Theme) => {
  const { vars, spacingPx, borderRadius, getColorSchemeSelector } = theme;

  return {
    position: 'absolute',
    top: spacingPx[4],
    left: spacingPx[4],
    width: spacingPx[24],
    height: spacingPx[24],
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

  return {
    position: 'absolute',
    top: spacingPx[4],
    left: atEnd ? endSlot(theme) : spacingPx[4],
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacingPx[24],
    height: spacingPx[24],
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
