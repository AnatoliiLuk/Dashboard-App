import type { Theme } from '@mui/material/styles';

export const pageStyle = ({ palette, spacing }: Theme) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: palette.background.default,
  color: palette.text.primary,
  px: spacing(3),
  py: spacing(6),
});

export const mainStyle = {
  width: '100%',
  maxWidth: 768,
};

export const eyebrowStyle = ({ palette }: Theme) => ({
  color: palette.text.secondary,
  fontWeight: 500,
});

export const titleStyle = ({ spacing }: Theme) => ({
  mt: spacing(1),
});

export const descriptionStyle = ({ palette, spacing }: Theme) => ({
  mt: spacing(1),
  maxWidth: 576,
  color: palette.text.secondary,
});

export const codeStyle = {
  fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
  fontSize: '0.875rem',
};

export const errorStyle = ({ palette, spacing }: Theme) => ({
  border: `1px solid ${palette.error.main}`,
  backgroundColor: palette.error.light,
  color: palette.error.main,
  borderRadius: '12px',
  px: spacing(2),
  py: spacing(1.5),
});

export const loadingStyle = ({ palette }: Theme) => ({
  color: palette.text.secondary,
});

export const statsStyle = ({ spacing }: Theme) => ({
  display: 'grid',
  gap: spacing(2),
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
});

export const cardStyle = ({ palette, spacing }: Theme) => ({
  border: `1px solid ${palette.divider}`,
  backgroundColor: palette.background.paper,
  borderRadius: '16px',
  p: spacing(2.5),
});

export const cardLabelStyle = ({ palette }: Theme) => ({
  color: palette.text.secondary,
});

export const cardValueStyle = ({ spacing }: Theme) => ({
  mt: spacing(1),
});

export const cardNoteStyle = ({ palette, spacing }: Theme) => ({
  mt: spacing(1),
  color: palette.text.secondary,
});

export const activitySectionStyle = (theme: Theme) => ({
  ...cardStyle(theme),
  mt: theme.spacing(3),
});

export const activityListStyle = ({ palette, spacing }: Theme) => ({
  mt: spacing(2),
  p: 0,
  listStyle: 'none',
  '& > li + li': {
    borderTop: `1px solid ${palette.divider}`,
  },
});

export const activityItemStyle = ({ spacing }: Theme) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: spacing(2),
  py: spacing(1.5),
});

export const activityDetailStyle = ({ palette }: Theme) => ({
  color: palette.text.secondary,
});

export const activityTimeStyle = ({ palette }: Theme) => ({
  flexShrink: 0,
  color: palette.text.secondary,
});
