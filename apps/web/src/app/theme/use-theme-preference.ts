import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import {
  nextThemePreference,
  parseThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from './theme-preference';

function savedPreference(): ThemePreference {
  try {
    return (
      parseThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY)) ??
      'light'
    );
  } catch {
    // Storage can be unavailable in restricted or private browser contexts.
    return 'light';
  }
}

function systemThemeQuery(): MediaQueryList | null {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)');
  } catch {
    return null;
  }
}

/** Owns the browser-facing theme lifecycle for the persistent app shell. */
export function useThemePreference() {
  const media = systemThemeQuery();
  const [preference, setPreference] = createSignal<ThemePreference>(
    savedPreference(),
  );
  const [systemDark, setSystemDark] = createSignal(media?.matches ?? false);
  const resolvedTheme = createMemo(() =>
    resolveTheme(preference(), systemDark()),
  );

  // Apply before the shell mounts. The head bootstrap handles the earlier
  // interval before the application module is evaluated.
  document.documentElement.dataset.theme = resolvedTheme();

  const onSystemChange = (event: MediaQueryListEvent) => {
    setSystemDark(event.matches);
  };
  media?.addEventListener('change', onSystemChange);
  onCleanup(() => media?.removeEventListener('change', onSystemChange));

  createEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme();
  });
  createEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference());
    } catch {
      // The current session still responds to the button without storage.
    }
  });

  return {
    preference,
    resolvedTheme,
    cycle: () => setPreference((current) => nextThemePreference(current)),
  };
}
