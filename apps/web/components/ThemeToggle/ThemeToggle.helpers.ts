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

  return {
    isDark,
    label:
      isDark === undefined
        ? translate('theme.toggle')
        : isDark
          ? translate('theme.toLight')
          : translate('theme.toDark'),
    nextMode: isDark ? ('light' as const) : ('dark' as const),
  } as const;
}
