import { Show } from 'solid-js';
import type { RegistryAssetRow } from '../../demo/registry-fixture';
import type {
  RegistryReviewSnapshot,
  RegistrySourceReview,
} from '../../model/registry-review';
import type { RegistrySelectionRead } from '../../model/registry-review-query';
import { SamplePanel } from '../overview/SamplePanel';
import { RegistryMapping } from './RegistryMapping';
import { RegistrySourceProvenance } from './RegistrySourceProvenance';
import { RegistryUnresolved } from './RegistryUnresolved';

/** The right zone binds selected identity, complete mapping, and source evidence. */
export function RegistryDetailZone(props: {
  readonly selectedAsset: RegistryAssetRow | null;
  readonly requestedAsset: RegistrySelectionRead;
  readonly snapshot: RegistryReviewSnapshot | null;
  readonly selectedSource: RegistrySourceReview | null;
  readonly requestedSourceKey: string | null;
  readonly onSelectSource: (key: string) => void;
}) {
  return (
    <div class="grid min-w-0 gap-3 lg:col-span-2 xl:col-span-1">
      <Show
        when={props.selectedAsset}
        fallback={
          <SamplePanel
            title="Selected asset"
            description="Sample registry identity"
          >
            <p role="status" class="p-5 text-xs text-muted">
              {props.requestedAsset.status === 'invalid'
                ? 'The asset selection in this URL is invalid.'
                : props.requestedAsset.status === 'value'
                  ? 'That asset is not in this tenant’s sample catalogue.'
                  : 'No sample asset is available for this tenant.'}
            </p>
          </SamplePanel>
        }
      >
        {(asset) => (
          <RegistryMapping
            asset={asset()}
            snapshot={props.snapshot}
            selectedSourceKey={props.selectedSource?.key ?? null}
            onSelectSource={props.onSelectSource}
          />
        )}
      </Show>
      <Show when={props.snapshot}>
        {(current) => (
          <>
            <RegistryUnresolved
              snapshot={current()}
              onSelectSource={props.onSelectSource}
            />
            <RegistrySourceProvenance
              snapshot={current()}
              selected={props.selectedSource}
              requestedSourceKey={props.requestedSourceKey}
            />
          </>
        )}
      </Show>
    </div>
  );
}
