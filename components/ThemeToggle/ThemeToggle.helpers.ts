type ColorSchemeMode = 'light' | 'dark' | 'system' | undefined;

export function getThemeToggleState(
  mode: ColorSchemeMode,
  systemMode: 'light' | 'dark' | undefined,
) {
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const isDark = (resolvedMode ?? 'dark') === 'dark';

  return {
    label: isDark ? 'Light' : 'Dark',
    nextMode: isDark ? 'light' : 'dark',
  } as const;
}
