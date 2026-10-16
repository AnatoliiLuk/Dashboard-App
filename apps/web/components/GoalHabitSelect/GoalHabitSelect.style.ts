import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const habitSelectStyle = ({ spacingPx }: Theme) => ({
  width: '100%',
  '&& .MuiAutocomplete-inputRoot': {
    flexWrap: 'nowrap',
    alignItems: 'center',
    boxSizing: 'border-box',
    height: spacingPx[44],
    minHeight: spacingPx[44],
    maxHeight: spacingPx[44],
    overflow: 'hidden',
  },
  '&& .MuiChip-root': {
    height: spacingPx[24],
    minHeight: spacingPx[24],
    maxHeight: spacingPx[24],
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  '& .MuiChip-label': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  '& .MuiChip-deleteIcon': {
    width: spacingPx[16],
    height: spacingPx[16],
    flexShrink: 0,
  },
  '&& .MuiAutocomplete-popupIndicator, && .MuiAutocomplete-clearIndicator': {
    width: spacingPx[24],
    height: spacingPx[24],
    minWidth: spacingPx[24],
    minHeight: spacingPx[24],
    padding: spacingPx[0],
  },
});
