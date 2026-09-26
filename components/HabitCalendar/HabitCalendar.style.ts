import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const calendarSectionStyle = ({ spacingPx }: Theme) => ({
  mb: spacingPx[32],
});

export const monthBarStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacingPx[12],
  mb: spacingPx[16],
});

export const monthButtonStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
  typography,
}: Theme) => ({
  border: border[1],
  borderColor: vars.palette.divider,
  backgroundColor: vars.palette.background.paper,
  color: vars.palette.text.primary,
  borderRadius: borderRadius.pill,
  px: spacingPx[12],
  py: spacingPx[6],
  fontFamily: typography.button.fontFamily,
  fontSize: typography.button.fontSize,
  fontWeight: typography.button.fontWeight,
  lineHeight: typography.button.lineHeight,
  cursor: 'pointer',
});

export const tableWrapStyle = {
  overflowX: 'auto',
};

export const tableStyle = ({ vars, border, borderRadius }: Theme) => ({
  width: '100%',
  minWidth: 720,
  borderCollapse: 'separate',
  borderSpacing: 0,
  tableLayout: 'fixed',
  border: border[1],
  borderColor: vars.palette.divider,
  borderRadius: borderRadius.md,
  backgroundColor: vars.palette.background.paper,
  overflow: 'hidden',
});

export const headerCellStyle = ({ vars, spacingPx, border }: Theme) => ({
  padding: spacingPx[8],
  borderBottom: border[1],
  borderBottomColor: vars.palette.divider,
  color: vars.palette.text.secondary,
  fontWeight: 500,
  textAlign: 'left',
});

export const cellStyle = ({ vars, spacingPx, border }: Theme) => ({
  verticalAlign: 'top',
  height: 96,
  padding: spacingPx[8],
  borderTop: border[1],
  borderTopColor: vars.palette.divider,
  borderLeft: border[1],
  borderLeftColor: vars.palette.divider,
  '&:first-of-type': {
    borderLeft: 'none',
  },
});

export const outsideStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
  backgroundColor: vars.palette.background.default,
});

export const todayStyle = ({ vars }: Theme) => ({
  boxShadow: `inset 0 0 0 2px ${vars.palette.text.primary}`,
});

export const dayNumberStyle = ({ typography }: Theme) => ({
  fontWeight: typography.fontWeightMedium,
});

export const habitListStyle = ({ spacingPx }: Theme) => ({
  m: 0,
  mt: spacingPx[8],
  p: 0,
  listStyle: 'none',
});

export const habitItemStyle = ({ vars, typography }: Theme) => ({
  color: vars.palette.text.secondary,
  fontSize: typography.body2.fontSize,
  lineHeight: typography.body2.lineHeight,
});
