import { useLocation, useParams } from '@solidjs/router';
import { lazy, Show, Suspense } from 'solid-js';
import { ConnectionNotice } from '#shared/ui';
import { isAssetInspectorSamplePreview } from '../model/asset-preview-url';

const DevelopmentInspectorContent = import.meta.env.DEV
  ? lazy(() => import('./DevelopmentInspectorContent'))
  : undefined;
const SampleContent = DevelopmentInspectorContent ?? (() => null);

/** Route boundary for a tenant-scoped asset inspector. */
export function AssetInspectorPage() {
  const params = useParams<{ assetId: string }>();
  const location = useLocation();
  const showingSample = () =>
    Boolean(DevelopmentInspectorContent) &&
    isAssetInspectorSamplePreview(location.pathname, location.search);

  return (
    <Show
      when={showingSample()}
      fallback={
        <div class="grid max-w-3xl gap-5">
          <header>
            <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              Workspace / Assets / Inspector
            </p>
            <h1
              id="page-title"
              class="mt-1 text-2xl font-semibold tracking-tight"
            >
              Asset inspector
            </h1>
          </header>
          <ConnectionNotice heading="Asset inspector is not connected">
            Asset identity and relationships require an approved browser
            identity connection. Telemetry, history, condition, and attribution
            need backend-owned read models before they can be shown here.
          </ConnectionNotice>
        </div>
      }
    >
      <Suspense fallback={<p role="status">Opening sample inspector…</p>}>
        <SampleContent assetId={params.assetId} />
      </Suspense>
    </Show>
  );
}
