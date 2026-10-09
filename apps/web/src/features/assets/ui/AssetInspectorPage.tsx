import { useLocation, useParams } from '@solidjs/router';
import { lazy, Show, Suspense } from 'solid-js';
import { isAssetInspectorSamplePreview } from '../model/asset-preview-url';
import { ConnectedInspectorView } from './connected/ConnectedInspectorView';

const DevelopmentInspectorContent = import.meta.env.DEV
  ? lazy(() => import('./DevelopmentInspectorContent'))
  : undefined;
const SampleContent = DevelopmentInspectorContent ?? (() => null);

/** Route boundary for an authenticated tenant-scoped inspector or explicit dev preview. */
export function AssetInspectorPage() {
  const params = useParams<{ assetId: string }>();
  const location = useLocation();
  const showingSample = () =>
    Boolean(DevelopmentInspectorContent) &&
    isAssetInspectorSamplePreview(location.pathname, location.search);
  return (
    <Show
      when={showingSample()}
      fallback={<ConnectedInspectorView assetId={params.assetId} />}
    >
      <Suspense fallback={<p role="status">Opening sample inspector…</p>}>
        <SampleContent assetId={params.assetId} />
      </Suspense>
    </Show>
  );
}
