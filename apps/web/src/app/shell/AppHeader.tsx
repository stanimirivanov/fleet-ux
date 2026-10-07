import { A, useLocation } from '@solidjs/router';
import { isAssetSamplePreview } from '#features/assets';
import { ThemeButton } from '../theme/ThemeButton';
import { useThemePreference } from '../theme/use-theme-preference';

/** Persistent product header and its locally owned theme preference. */
export function AppHeader() {
  const theme = useThemePreference();
  const location = useLocation();
  const sourceStatus = () =>
    import.meta.env.DEV &&
    isAssetSamplePreview(location.pathname, location.search)
      ? 'Sample data · development'
      : 'Data source unconfigured';

  return (
    <header class="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-outline bg-surface px-5 sm:px-7">
      <A
        href="/"
        aria-label="FleetIQ overview"
        class="flex min-w-0 items-center gap-3"
      >
        <span
          aria-hidden="true"
          class="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-xs font-bold text-on-accent"
        >
          FI
        </span>
        <span class="truncate text-lg font-bold tracking-tight">FleetIQ</span>
      </A>
      <div class="flex items-center gap-3">
        <span class="hidden text-xs font-medium text-muted sm:inline">
          {sourceStatus()}
        </span>
        <ThemeButton
          preference={theme.preference}
          resolvedTheme={theme.resolvedTheme}
          onCycle={theme.cycle}
        />
      </div>
    </header>
  );
}
