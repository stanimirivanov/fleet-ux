import { createMemo, Show } from 'solid-js';
import { PREVIEW_ASSETS } from '../api/fixture-asset-reader';
import { getDemoInspector } from '../demo/inspector-fixture';
import { InspectorWorkspace } from './inspector/InspectorWorkspace';

/** Explicitly synthetic inspector composition, excluded from production. */
export default function DevelopmentInspectorContent(props: {
  readonly assetId: string;
}) {
  const inspector = createMemo(() =>
    getDemoInspector('tenant-a', props.assetId),
  );
  const knownAsset = createMemo(() =>
    PREVIEW_ASSETS.find((asset) => asset.id === props.assetId),
  );

  return (
    <Show
      when={inspector()}
      fallback={
        <div class="grid max-w-3xl gap-5">
          <header>
            <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              Workspace / Assets / Sample inspector
            </p>
            <h1
              id="page-title"
              class="mt-1 text-2xl font-semibold tracking-tight"
            >
              {knownAsset()?.name ?? 'Sample asset not found'}
            </h1>
          </header>
          <section class="rounded-panel border border-sample-outline bg-sample-surface p-6">
            <span class="text-[10px] font-semibold uppercase tracking-wide text-accent">
              Sample data
            </span>
            <h2 class="mt-3 text-lg font-semibold">
              {knownAsset()
                ? 'No sample topology for this asset'
                : 'This asset is not in the sample catalogue'}
            </h2>
            <p class="mt-2 text-sm text-muted">
              {knownAsset()
                ? 'The sample catalogue identifies this asset, but no subsystem or signal evidence has been modelled for it.'
                : 'Check the asset ID or return to the sample catalogue.'}
            </p>
            <a
              class="mt-4 inline-block text-sm font-semibold text-accent underline"
              href="/assets?preview=sample"
            >
              Browse sample assets
            </a>
          </section>
        </div>
      }
    >
      {(current) => <InspectorWorkspace inspector={current()} />}
    </Show>
  );
}
