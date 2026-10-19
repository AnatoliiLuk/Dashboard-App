import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

import type { HabitStatus } from './HabitCard.interface';

export const habitStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  border: border[1],
  borderColor: vars.palette.divider,
  backgroundColor: vars.palette.background.paper,
  borderRadius: borderRadius.md,
  p: spacingPx[20],
});

export const habitTopStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: spacingPx[16],
});

export const habitNameStyle = {
  minWidth: 0,
  flex: 1,
};

export const actionsStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: spacingPx[8],
});

export const selectedHabitStyle = ({ vars }: Theme) => ({
  borderColor: vars.palette.primary.main,
});

export const messageStyle =
  (status: HabitStatus) =>
  ({ vars, spacingPx }: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacingPx[8],
    mt: spacingPx[8],
    color: vars.palette[status].main,
    '& svg': {
      flexShrink: 0,
    },
  });

export const footerStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: spacingPx[16],
  mt: spacingPx[16],
});

export const daysStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  gap: spacingPx[8],
});

export const dayStyle = ({ vars, borderRadius }: Theme) => ({
  width: 12,
  height: 12,
  borderRadius: borderRadius.pill,
  backgroundColor: vars.palette.divider,
});

export const dayDoneStyle = ({ vars, borderRadius }: Theme) => ({
  width: 12,
  height: 12,
  borderRadius: borderRadius.pill,
  backgroundColor: vars.palette.text.primary,
});
