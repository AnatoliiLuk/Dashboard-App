type ColorSchemeMode = 'light' | 'dark' | 'system' | undefined;

export function getThemeToggleState(
  mode: ColorSchemeMode,
  systemMode: 'light' | 'dark' | undefined,
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
        ? 'Toggle color theme'
        : isDark
          ? 'Switch to light theme'
          : 'Switch to dark theme',
    nextMode: isDark ? ('light' as const) : ('dark' as const),
  } as const;
}
