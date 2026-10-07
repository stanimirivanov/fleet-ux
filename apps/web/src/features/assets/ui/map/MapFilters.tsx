import { For } from 'solid-js';
import type { DemoMapAsset } from '../../demo/map-fixture';
import type { MapWorkbenchFilters } from '../../model/map-workbench';

type FilterKey = Exclude<keyof MapWorkbenchFilters, 'selectedAssetId'>;

/** URL-backed search and facets apply only to the complete local sample set. */
export function MapFilters(props: {
  readonly assets: readonly DemoMapAsset[];
  readonly filters: MapWorkbenchFilters;
  readonly onChange: (key: FilterKey, value: string) => void;
}) {
  const types = () =>
    [...new Set(props.assets.map((row) => row.asset.assetType.id))].sort();
  const sites = () =>
    [...new Set(props.assets.map((row) => row.operations.siteLabel))].sort();
  const controlClass =
    'mt-1 block h-9 w-full rounded-md border border-outline bg-surface px-2 text-xs text-foreground';

  return (
    <div class="grid gap-2 px-4 py-3 sm:grid-cols-2 xl:grid-cols-1 lg:shrink-0">
      <label class="text-[11px] font-medium text-muted sm:col-span-2 xl:col-span-1">
        Search assets
        <input
          type="search"
          value={props.filters.q}
          onInput={(event) => props.onChange('q', event.currentTarget.value)}
          placeholder="Name, ID, type, or site"
          class={`${controlClass} px-3 placeholder:text-muted`}
        />
      </label>
      <label class="text-[11px] font-medium text-muted">
        Asset type
        <select
          aria-label="Asset type"
          value={props.filters.type}
          onChange={(event) =>
            props.onChange('type', event.currentTarget.value)
          }
          class={controlClass}
        >
          <option value="">All types</option>
          <For each={types()}>
            {(type) => <option value={type}>{type}</option>}
          </For>
        </select>
      </label>
      <label class="text-[11px] font-medium text-muted">
        Site
        <select
          aria-label="Site"
          value={props.filters.site}
          onChange={(event) =>
            props.onChange('site', event.currentTarget.value)
          }
          class={controlClass}
        >
          <option value="">All sites</option>
          <For each={sites()}>
            {(site) => <option value={site}>{site}</option>}
          </For>
        </select>
      </label>
      <label class="text-[11px] font-medium text-muted">
        Condition
        <select
          aria-label="Condition"
          value={props.filters.condition}
          onChange={(event) =>
            props.onChange('condition', event.currentTarget.value)
          }
          class={controlClass}
        >
          <option value="">All conditions</option>
          <option value="nominal">Nominal</option>
          <option value="attention">Attention</option>
          <option value="critical">Critical</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>
      <label class="text-[11px] font-medium text-muted">
        Device connection
        <select
          aria-label="Device connection"
          value={props.filters.connectivity}
          onChange={(event) =>
            props.onChange('connectivity', event.currentTarget.value)
          }
          class={controlClass}
        >
          <option value="">All connections</option>
          <option value="connected">Connected</option>
          <option value="disconnected">Disconnected</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>
      <label class="text-[11px] font-medium text-muted sm:col-span-2 xl:col-span-1">
        Position evidence
        <select
          aria-label="Position evidence"
          value={props.filters.position}
          onChange={(event) =>
            props.onChange('position', event.currentTarget.value)
          }
          class={controlClass}
        >
          <option value="">All position states</option>
          <option value="recent">Recent at snapshot</option>
          <option value="last-known">Last known</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </label>
    </div>
  );
}
