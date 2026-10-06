import { A, useLocation } from '@solidjs/router';
import { createEffect, on, type ParentProps } from 'solid-js';
import { ThemeButton } from './theme/ThemeButton';
import { useThemePreference } from './theme/use-theme-preference';

/** Router root layout: the frame remains mounted as route content changes. */
export function AppShell(props: ParentProps) {
  const theme = useThemePreference();
  const location = useLocation();
  const showingSample = () =>
    import.meta.env.DEV &&
    location.pathname === '/assets' &&
    new URLSearchParams(location.search).get('preview') === 'sample';
  let mainElement: HTMLElement | undefined;

  createEffect(() => {
    const pathname = location.pathname;
    const pageTitle =
      pathname === '/'
        ? 'Fleet overview'
        : pathname === '/assets'
          ? 'Assets'
          : pathname === '/design-system'
            ? 'Design system'
            : 'Page not found';
    document.title = `${pageTitle} · FleetIQ`;
  });

  // Announce client-side navigation through the newly titled main landmark.
  createEffect(
    on(
      () => location.pathname + location.search,
      () => queueMicrotask(() => mainElement?.focus()),
      { defer: true },
    ),
  );

  return (
    <>
      <a href="#main-content" class="fi-skip-link">
        Skip to main content
      </a>
      <div class="min-h-screen bg-canvas text-foreground">
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
            <span class="truncate text-lg font-bold tracking-tight">
              FleetIQ
            </span>
          </A>
          <div class="flex items-center gap-3">
            <span class="hidden text-xs font-medium text-muted sm:inline">
              {showingSample()
                ? 'Sample data · development'
                : 'Data source unconfigured'}
            </span>
            <ThemeButton
              preference={theme.preference}
              resolvedTheme={theme.resolvedTheme}
              onCycle={theme.cycle}
            />
          </div>
        </header>

        <div class="grid min-h-[calc(100vh-4rem)] md:grid-cols-[15rem_minmax(0,1fr)]">
          <aside class="min-w-0 border-b border-outline bg-surface md:border-r md:border-b-0">
            <nav
              aria-label="Primary navigation"
              class="flex gap-1 overflow-x-auto p-3 md:sticky md:top-16 md:flex-col md:gap-1 md:p-4"
            >
              <span class="hidden px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted md:block">
                Workspaces
              </span>
              <A
                href="/"
                end
                class="fi-nav-link"
                activeClass="fi-nav-link--active"
              >
                Overview
              </A>
              <A
                href="/assets"
                end
                class="fi-nav-link"
                activeClass="fi-nav-link--active"
              >
                Assets
              </A>
              <span class="hidden px-3 pb-1 pt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted md:block">
                Reference
              </span>
              <A
                href="/design-system"
                end
                class="fi-nav-link"
                activeClass="fi-nav-link--active"
              >
                Design system
              </A>
            </nav>
          </aside>

          <main
            ref={mainElement}
            id="main-content"
            tabindex="-1"
            aria-labelledby="page-title"
            class="min-w-0 px-5 py-8 sm:px-8 lg:px-10"
          >
            {props.children}
          </main>
        </div>
      </div>
    </>
  );
}
