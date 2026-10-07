import { A } from '@solidjs/router';
import { Show } from 'solid-js';
import type { RegistryAssetRow } from '../../demo/registry-fixture';
import { assetInspectorSampleHref } from '../../model/asset-preview-url';
import { SamplePanel } from '../overview/SamplePanel';

/** Registered identity is separate from condition, telemetry, and mapping evidence. */
export function RegistryAssetIdentity(props: {
  readonly asset: RegistryAssetRow;
}) {
  return (
    <SamplePanel
      title="Selected asset"
      description="Stable identity, separate from observed operating state"
    >
      <div class="grid gap-3 p-4 text-xs sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div class="min-w-0">
          <h3 class="text-lg font-semibold">{props.asset.asset.name}</h3>
          <p class="mt-1 break-all font-mono text-muted">
            {props.asset.asset.id}
          </p>
          <p class="mt-1 break-all text-muted">
            {props.asset.asset.assetType.id} v
            {props.asset.asset.assetType.version}
          </p>
          <p class="mt-2 text-muted">
            {props.asset.modeled
              ? 'An illustrative structure is available for this asset.'
              : 'This sample contains identity only; structure and mapping have not been modeled.'}
          </p>
        </div>
        <Show when={props.asset.modeled}>
          <A
            href={assetInspectorSampleHref(props.asset.asset.id)}
            class="inline-flex min-h-9 items-center rounded-md border border-outline bg-surface px-3 text-xs font-semibold text-accent hover:bg-canvas"
          >
            View evidence inspector
          </A>
        </Show>
      </div>
    </SamplePanel>
  );
}
