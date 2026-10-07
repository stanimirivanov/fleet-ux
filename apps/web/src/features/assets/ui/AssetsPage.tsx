import { lazy, Suspense } from 'solid-js';
import { ConnectionNotice, PageHeader } from '#shared/ui';

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
    <div class="grid max-w-6xl gap-8">
      <PageHeader eyebrow="Workspace" title="Assets">
        The catalogue supports equipment-neutral assets. A device, component,
        and physical asset retain separate identities as those contracts arrive.
      </PageHeader>
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
