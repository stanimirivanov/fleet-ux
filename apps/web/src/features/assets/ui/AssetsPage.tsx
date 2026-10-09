import { useLocation } from '@solidjs/router';
import { lazy, Show, Suspense } from 'solid-js';
import { ConnectionNotice } from '#shared/ui';
import { isAssetSamplePreview } from '../model/asset-preview-url';
import { ConnectedCatalogueView } from './connected/ConnectedCatalogueView';

const DevelopmentAssetsContent = import.meta.env.DEV
  ? lazy(() => import('./DevelopmentAssetsContent'))
  : undefined;
const SampleContent = DevelopmentAssetsContent ?? (() => null);

/** Route boundary: only explicit development previews render illustrative data. */
export function AssetsPage() {
  const location = useLocation();
  const showingSample = () =>
    Boolean(DevelopmentAssetsContent) &&
    isAssetSamplePreview(location.pathname, location.search);
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
          Find equipment by stable identity and pinned type. Operational states
          in sample views are illustrative.
        </p>
      </header>
      <Show when={showingSample()} fallback={<ConnectedCatalogueView />}>
        <Suspense
          fallback={
            <p role="status" class="text-sm text-muted">
              Opening development catalogue…
            </p>
          }
        >
          <SampleContent
            connectionNotice={
              <ConnectionNotice heading="The asset catalogue is not connected">
                The explicit development preview uses illustrative identities.
                Ordinary routes use the approved browser identity and metadata
                connection.
              </ConnectionNotice>
            }
          />
        </Suspense>
      </Show>
    </div>
  );
}
