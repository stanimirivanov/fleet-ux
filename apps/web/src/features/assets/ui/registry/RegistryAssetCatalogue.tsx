import { createMemo, For, Show } from 'solid-js';
import type { RegistryAssetRow } from '../../demo/registry-fixture';
import { SamplePanel } from '../overview/SamplePanel';

export interface RegistryCatalogueFilters {
  readonly q: string;
  readonly type: string;
}

/** Asset identity discovery stays separate from sample structure coverage. */
export function RegistryAssetCatalogue(props: {
  readonly assets: readonly RegistryAssetRow[];
  readonly visibleAssets: readonly RegistryAssetRow[];
  readonly filters: RegistryCatalogueFilters;
  readonly selectedAssetId: string | null;
  readonly onSearch: (query: string) => void;
  readonly onType: (type: string) => void;
  readonly onSelect: (assetId: string) => void;
}) {
  const types = createMemo(() =>
    [...new Set(props.assets.map((row) => row.asset.assetType.id))].sort(),
  );

  return (
    <SamplePanel
      title="Asset catalogue"
      description="Find an identity and review its modeled structure"
    >
      <div class="grid gap-3 p-4">
        <label class="grid gap-1 text-xs font-medium text-muted">
          Find an asset
          <input
            type="search"
            value={props.filters.q}
            onInput={(event) => props.onSearch(event.currentTarget.value)}
            placeholder="Name or ID"
            class="h-10 min-w-0 rounded-md border border-outline bg-surface px-3 text-sm text-foreground placeholder:text-muted"
          />
        </label>
        <label class="grid gap-1 text-xs font-medium text-muted">
          Asset type
          <select
            value={props.filters.type}
            onChange={(event) => props.onType(event.currentTarget.value)}
            class="h-10 min-w-0 rounded-md border border-outline bg-surface px-3 text-sm text-foreground"
          >
            <option value="">All types</option>
            <Show
              when={
                props.filters.type !== '' &&
                !types().includes(props.filters.type)
              }
            >
              <option value={props.filters.type}>
                Unavailable sample type · {props.filters.type}
              </option>
            </Show>
            <For each={types()}>
              {(type) => <option value={type}>{type}</option>}
            </For>
          </select>
        </label>
      </div>
      <p class="border-t border-outline px-4 py-2 text-[11px] text-muted">
        {props.visibleAssets.length} of {props.assets.length} sample identities
        shown
      </p>
      <Show
        when={props.visibleAssets.length > 0}
        fallback={
          <p
            role="status"
            class="border-t border-outline px-4 py-8 text-center text-xs text-muted"
          >
            No sample assets match these filters.
          </p>
        }
      >
        <ul
          aria-label="Registry assets"
          class="max-h-[38rem] overflow-y-auto border-t border-outline"
        >
          <For each={props.visibleAssets}>
            {(row) => (
              <li class="border-b border-outline last:border-b-0">
                <button
                  type="button"
                  aria-label={row.asset.name}
                  aria-pressed={row.asset.id === props.selectedAssetId}
                  onClick={() => props.onSelect(row.asset.id)}
                  class={
                    'flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left hover:bg-canvas ' +
                    (row.asset.id === props.selectedAssetId
                      ? 'border-l-[3px] border-accent bg-accent/5'
                      : 'border-l-[3px] border-transparent')
                  }
                >
                  <span
                    aria-hidden="true"
                    class="grid size-8 shrink-0 place-items-center rounded-md border border-outline bg-surface text-xs font-semibold text-accent"
                  >
                    {row.asset.name.charAt(0)}
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-xs font-semibold text-foreground">
                      {row.asset.name}
                    </span>
                    <span class="block break-all font-mono text-[10px] text-muted">
                      {row.asset.id}
                    </span>
                    <span class="block truncate text-[10px] text-muted">
                      {row.asset.assetType.id}
                    </span>
                  </span>
                  <span class="shrink-0 text-[10px] text-muted">
                    {row.modeled ? 'Example structure' : 'Identity only'}
                  </span>
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </SamplePanel>
  );
}
