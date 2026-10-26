import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Theme } from '@mui/material/styles';

export const messageStyle =
  (fromUser: boolean) =>
  ({ spacingPx }: Theme) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: fromUser ? 'flex-end' : 'flex-start',
    gap: spacingPx[4],
  });

export const authorStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});

export const bubbleStyle =
  (fromUser: boolean) =>
  ({ vars, spacingPx, border, borderRadius }: Theme) => ({
    maxWidth: '85%',
    px: spacingPx[16],
    py: spacingPx[12],
    borderRadius: borderRadius.md,
    border: border[1],
    borderColor: fromUser ? 'transparent' : vars.palette.divider,
    backgroundColor: fromUser
      ? vars.palette.text.primary
      : vars.palette.background.paper,
    color: fromUser ? vars.palette.background.paper : vars.palette.text.primary,
    // Replies are plain text; keep their line breaks and numbered lists.
    whiteSpace: 'pre-wrap' as const,
    overflowWrap: 'anywhere' as const,
  });

export const noteStyle = ({ vars }: Theme) => ({
  color: vars.palette.text.secondary,
});
