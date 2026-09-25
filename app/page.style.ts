import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const pageStyle = ({ vars, spacingPx }: Theme) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: vars.palette.background.default,
  color: vars.palette.text.primary,
  px: spacingPx[24],
  py: spacingPx[48],
});

export const mainStyle = ({ spacingPx }: Theme) => ({
  width: '100%',
  maxWidth: spacingPx[768],
});

export const headerStyle = ({ spacingPx }: Theme) => ({
  mb: spacingPx[32],
});

export const headerTopStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacingPx[16],
});

export const eyebrowStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const titleStyle = ({ spacingPx }: Theme) => ({
  mt: spacingPx[8],
});

export const descriptionStyle = ({ vars, spacingPx }: Theme) => ({
  mt: spacingPx[8],
  maxWidth: spacingPx[576],
  color: vars.palette.text.secondary,
});

export const codeStyle = ({ typography }: Theme) => ({
  fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
  fontSize: typography.body2.fontSize,
});

export const errorStyle = ({
  vars,
  spacingPx,
  border,
  borderRadius,
}: Theme) => ({
  border: border[1],
  borderColor: vars.palette.error.main,
  backgroundColor: vars.palette.error.light,
  color: vars.palette.error.main,
  borderRadius: borderRadius.sm,
  px: spacingPx[16],
  py: spacingPx[12],
});

export const loadingStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const statsStyle = ({ spacingPx }: Theme) => ({
  display: 'grid',
  gap: spacingPx[16],
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
});

export const cardStyle = ({
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

export const cardLabelStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const cardValueStyle = ({ spacingPx }: Theme) => ({
  mt: spacingPx[8],
});

export const cardNoteStyle = ({ vars, spacingPx }: Theme) => ({
  mt: spacingPx[8],
  color: vars.palette.text.secondary,
});

export const activitySectionStyle = (theme: Theme) => ({
  ...cardStyle(theme),
  mt: theme.spacingPx[24],
});

export const activityListStyle = ({ vars, spacingPx, border }: Theme) => ({
  mt: spacingPx[16],
  p: spacingPx[0],
  listStyle: 'none',
  '& > li + li': {
    borderTop: border[1],
    borderColor: vars.palette.divider,
  },
});

export const activityItemStyle = ({ spacingPx }: Theme) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: spacingPx[16],
  py: spacingPx[12],
});

export const activityTitleStyle = ({ typography }: Theme) => ({
  fontWeight: typography.fontWeightMedium,
});

export const activityDetailStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const activityTimeStyle = ({ vars }: Theme) => ({
  flexShrink: 0,
  color: vars.palette.text.secondary,
});
