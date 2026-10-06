import { lazy, Suspense } from 'solid-js';
import { StatusBadge } from '../../../shared/ui/StatusBadge';

const DevelopmentAssetsContent = import.meta.env.DEV
  ? lazy(() => import('./DevelopmentAssetsContent'))
  : undefined;

/** Route content; development sample code is a separate dev-only chunk. */
export function AssetsPage() {
  return (
    <div class="max-w-6xl">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Workspace
      </p>
      <h1 id="page-title" class="mt-2 text-3xl font-semibold tracking-tight">
        Assets
      </h1>
      <p class="mt-3 max-w-2xl text-base leading-7 text-muted">
        The catalogue supports equipment-neutral assets. A device, component,
        and physical asset retain separate identities as those contracts arrive.
      </p>

      {DevelopmentAssetsContent ? (
        <Suspense
          fallback={
            <p role="status" class="mt-8 text-sm text-muted">
              Opening development catalogue…
            </p>
          }
        >
          <DevelopmentAssetsContent connectionNotice={<ConnectionNotice />} />
        </Suspense>
      ) : (
        <ConnectionNotice />
      )}
    </div>
  );
}

function ConnectionNotice() {
  return (
    <section
      aria-labelledby="connection-heading"
      class="mt-8 max-w-3xl rounded-panel border border-outline bg-surface p-6 sm:p-8"
    >
      <StatusBadge label="Unconfigured" tone="unknown" />
      <h2 id="connection-heading" class="mt-5 text-xl font-semibold">
        The asset catalogue is not connected
      </h2>
      <p class="mt-2 max-w-2xl text-sm leading-7 text-muted">
        A tenant-scoped catalogue contract is available, but this browser has no
        approved identity connection or asset data source. This is a connection
        state, not a claim that the fleet contains no assets.
      </p>
    </section>
  );
}
