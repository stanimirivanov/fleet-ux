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

/** Move keyboard focus to the main landmark after client-side navigation. */
export function useRouteFocus(
  mainElement: () => HTMLElement | undefined,
): void {
  const location = useLocation();
  createEffect(
    on(
      () => location.pathname + location.search,
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
