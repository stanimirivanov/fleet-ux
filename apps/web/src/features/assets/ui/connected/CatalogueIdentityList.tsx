import { For, Show } from 'solid-js';
import type { AssetSummary } from '../../model/asset-catalogue';
import { CatalogueAssetRow } from './CatalogueAssetRow';
import type { MetadataWorkspace } from './useMetadataWorkspace';

/** One current-page projection; an empty filter result is distinct from an empty page. */
export function CatalogueIdentityList(props: {
  readonly assets: readonly AssetSummary[];
  readonly pageIsEmpty: boolean;
  readonly workspace: MetadataWorkspace;
  readonly selectable: boolean;
}) {
  return (
    <Show
      when={props.assets.length > 0}
      fallback={
        <p role="status" class="text-sm text-muted">
          {props.pageIsEmpty
            ? 'This catalogue page contains no assets.'
            : 'No assets on this page match the current filters.'}
        </p>
      }
    >
      <ul
        aria-label="Connected assets"
        class="overflow-hidden rounded-lg border border-outline"
      >
        <For each={props.assets}>
          {(asset) => (
            <CatalogueAssetRow
              asset={asset}
              workspace={props.workspace}
              selectable={props.selectable}
            />
          )}
        </For>
      </ul>
    </Show>
  );
}
