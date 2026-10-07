import { useLocation } from '@solidjs/router';
import { createEffect, on, onCleanup } from 'solid-js';
import { routeTitle } from '../route-metadata';

/** Keep browser chrome aligned with the current route. */
export function useDocumentTitle(): void {
  const location = useLocation();
  createEffect(() => {
    document.title = `${routeTitle(location.pathname)} · FleetIQ`;
  });
}

/**
 * Move focus after a route change, leaving query-backed controls undisturbed.
 *
 * Search, filters, tabs, and selected inspector nodes update the URL without
 * replacing the page. Refocusing main on those edits steals keyboard focus.
 */
export function useRouteFocus(
  mainElement: () => HTMLElement | undefined,
): void {
  const location = useLocation();
  createEffect(
    on(
      () => location.pathname,
      () => {
        let cancelled = false;
        queueMicrotask(() => {
          if (!cancelled) mainElement()?.focus();
        });
        onCleanup(() => {
          cancelled = true;
        });
      },
      { defer: true },
    ),
  );
}
