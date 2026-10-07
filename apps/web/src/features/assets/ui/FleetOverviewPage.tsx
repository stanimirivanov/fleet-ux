import { lazy, Suspense } from 'solid-js';
import { ConnectionNotice } from '#shared/ui';

const DevelopmentOverviewContent = import.meta.env.DEV
  ? lazy(() => import('./DevelopmentOverviewContent'))
  : undefined;

/** Feature route composition keeps demo operations out of the production bundle. */
export function FleetOverviewPage() {
  return (
    <div class="grid min-w-0 gap-3">
      <header class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            id="page-title"
            class="text-2xl font-semibold tracking-tight sm:text-[1.7rem]"
          >
            Fleet overview
          </h1>
          <p class="mt-1 text-sm text-muted">
            Fleet condition, evidence coverage, and assets needing attention.
          </p>
        </div>
        {DevelopmentOverviewContent && (
          <p class="rounded-md border border-outline bg-surface px-3 py-1.5 text-xs text-muted">
            Fixed sample snapshot · 6 Oct 2026, 10:00 UTC
          </p>
        )}
      </header>
      {DevelopmentOverviewContent ? (
        <Suspense
          fallback={
            <p role="status" class="text-sm text-muted">
              Opening sample overview…
            </p>
          }
        >
          <DevelopmentOverviewContent />
        </Suspense>
      ) : (
        <div class="max-w-3xl">
          <ConnectionNotice heading="Fleet data is not connected yet">
            The web application has no tenant or telemetry API configured. Asset
            counts, locations, conditions, and alerts will appear only after
            approved backend connections and data-quality rules are in place.
          </ConnectionNotice>
        </div>
      )}
    </div>
  );
}
