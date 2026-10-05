/** The user's preferred theme, independent of the theme currently rendered. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** Versioned key so a future preference format can be migrated deliberately. */
export const THEME_STORAGE_KEY = 'fleetiq.theme-preference.v1';

/** Accept only known stored values; callers choose the fallback for missing data. */
export function parseThemePreference(value: unknown): ThemePreference | null {
  return value === 'light' || value === 'dark' || value === 'system'
    ? value
    : null;
}

/** Cycle the one-button control through its three labeled preferences. */
export function nextThemePreference(value: ThemePreference): ThemePreference {
  switch (value) {
    case 'light':
      return 'dark';
    case 'dark':
      return 'system';
    case 'system':
      return 'light';
  }
}

/** Resolve system preference at the boundary without losing that preference. */
export function resolveTheme(
  value: ThemePreference,
  systemDark: boolean,
): 'light' | 'dark' {
  return value === 'system' ? (systemDark ? 'dark' : 'light') : value;
}
