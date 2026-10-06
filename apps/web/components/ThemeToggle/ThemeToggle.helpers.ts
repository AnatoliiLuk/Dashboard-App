import type { TFunction } from 'i18next';

type ColorSchemeMode = 'light' | 'dark' | 'system' | undefined;

export function getThemeToggleState(
  mode: ColorSchemeMode,
  systemMode: 'light' | 'dark' | undefined,
  translate: TFunction,
) {
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const isDark =
    resolvedMode === 'light' || resolvedMode === 'dark'
      ? resolvedMode === 'dark'
      : undefined;

  let label: string;
  if (isDark === undefined) {
    label = translate('theme.toggle');
  } else if (isDark) {
    label = translate('theme.toLight');
  } else {
    label = translate('theme.toDark');
  }

  return {
    isDark,
    label,
    nextMode: isDark ? ('light' as const) : ('dark' as const),
  } as const;
}
