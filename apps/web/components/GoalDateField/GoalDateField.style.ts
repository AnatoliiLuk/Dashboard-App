import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

const DAY_SIZE = 44;
const DAY_MARGIN = 2;

export type RangePlacement = {
  inRange: boolean;
  capStart: boolean;
  capEnd: boolean;
};

export const dateFieldStyle = {
  width: '100%',
  minWidth: 0,
};

export const pickerStyle = {
  width: '100%',
};

export const rangeCellStyle =
  ({ inRange, capStart, capEnd }: RangePlacement) =>
  ({ vars, pxToRem }: Theme) => ({
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: pxToRem(DAY_SIZE + DAY_MARGIN * 2),
    height: pxToRem(DAY_SIZE),
    backgroundColor: inRange
      ? `rgba(${vars.palette.primary.mainChannel} / 0.22)`
      : 'transparent',
    borderStartStartRadius: capStart ? '50%' : 0,
    borderEndStartRadius: capStart ? '50%' : 0,
    borderStartEndRadius: capEnd ? '50%' : 0,
    borderEndEndRadius: capEnd ? '50%' : 0,
  });
