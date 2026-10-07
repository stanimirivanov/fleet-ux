import { lazy, Suspense } from 'solid-js';
import { ConnectionNotice } from '#shared/ui';

const DevelopmentAssetsContent = import.meta.env.DEV
  ? lazy(() => import('./DevelopmentAssetsContent'))
  : undefined;

function AssetConnectionNotice() {
  return (
    <ConnectionNotice heading="The asset catalogue is not connected">
      A tenant-scoped catalogue contract is available, but this browser has no
      approved identity connection or asset data source. This is a connection
      state, not a claim that the fleet contains no assets.
    </ConnectionNotice>
  );
}

/** Route composition for the asset workspace. Feature views own their own UI. */
export function AssetsPage() {
  return (
    <div class="grid min-w-0 gap-5">
      <header>
        <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          Workspace / Assets
        </p>
        <h1
          id="page-title"
          class="mt-1 text-2xl font-semibold tracking-tight sm:text-[1.7rem]"
        >
          Assets
        </h1>
        <p class="mt-1 text-sm text-muted">
          Find equipment by stable identity and type. Operational states in
          sample views are illustrative.
        </p>
      </header>
      {DevelopmentAssetsContent ? (
        <Suspense
          fallback={
            <p role="status" class="text-sm text-muted">
              Opening development catalogue…
            </p>
          }
        >
          <DevelopmentAssetsContent
            connectionNotice={<AssetConnectionNotice />}
          />
        </Suspense>
      ) : (
        <div class="max-w-3xl">
          <AssetConnectionNotice />
        </div>
      )}
    </div>
  );
}
