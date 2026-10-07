import { useLocation, useSearchParams } from '@solidjs/router';
import { createMemo, createSignal, Show } from 'solid-js';
import type { DemoMapWorkbench } from '../../demo/map-fixture';
import {
  filterMapAssets,
  type MapWorkbenchFilters,
  parseMapWorkbenchSearch,
  resolveSelectedMapAsset,
} from '../../model/map-workbench';
import { SamplePanel } from '../overview/SamplePanel';
import { AssetMapList } from './AssetMapList';
import { MapSelectionPanel } from './MapSelectionPanel';
import { formatMapTime } from './map-format';
import { SchematicMap } from './SchematicMap';

type FilterKey = Exclude<keyof MapWorkbenchFilters, 'selectedAssetId'>;

/** One URL selection drives the list, schematic markers, and context pane. */
export function MapWorkspace(props: { readonly workbench: DemoMapWorkbench }) {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const [narrowPane, setNarrowPane] = createSignal<'list' | 'map'>('list');
  const filters = createMemo(() => parseMapWorkbenchSearch(location.search));
  const assets = createMemo(() =>
    filterMapAssets(props.workbench.assets, filters()),
  );
  const selected = createMemo(() =>
    resolveSelectedMapAsset(assets(), filters().selectedAssetId),
  );
  const selectedId = () => selected()?.asset.id ?? null;
  const positionedCount = () =>
    assets().filter((row) => row.location.position !== null).length;

  const changeFilter = (key: FilterKey, value: string) =>
    setSearchParams(
      { [key]: value || undefined, asset: undefined },
      { replace: key === 'q' },
    );
  const selectAsset = (assetId: string) => setSearchParams({ asset: assetId });

  return (
    <div class="grid min-w-0 gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-sample-outline bg-sample-surface px-3 py-2 text-xs text-muted">
        <span>
          Illustrative site layout · positions are not geographic or live
        </span>
        <span class="tabular-nums">
          Fixed sample snapshot · {formatMapTime(props.workbench.asOf)}
        </span>
      </div>
      <fieldset class="flex gap-1 rounded-md border border-outline bg-surface p-1 lg:hidden">
        <legend class="sr-only">Map workspace view</legend>
        <button
          type="button"
          aria-pressed={narrowPane() === 'list'}
          onClick={() => setNarrowPane('list')}
          class={
            'flex-1 rounded px-3 py-2 text-xs font-semibold ' +
            (narrowPane() === 'list'
              ? 'bg-accent text-on-accent'
              : 'text-muted')
          }
        >
          Asset list
        </button>
        <button
          type="button"
          aria-pressed={narrowPane() === 'map'}
          onClick={() => setNarrowPane('map')}
          class={
            'flex-1 rounded px-3 py-2 text-xs font-semibold ' +
            (narrowPane() === 'map' ? 'bg-accent text-on-accent' : 'text-muted')
          }
        >
          Map view
        </button>
      </fieldset>
      <div class="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.7fr)] xl:grid-cols-[minmax(16rem,0.85fr)_minmax(0,1.6fr)_minmax(17rem,0.9fr)]">
        <div
          class={
            narrowPane() === 'list' ? 'min-w-0' : 'hidden min-w-0 lg:block'
          }
        >
          <AssetMapList
            allAssets={props.workbench.assets}
            assets={assets()}
            filters={filters()}
            selectedId={selectedId()}
            asOf={props.workbench.asOf}
            onFilterChange={changeFilter}
            onSelect={selectAsset}
          />
        </div>
        <div
          class={narrowPane() === 'map' ? 'min-w-0' : 'hidden min-w-0 lg:block'}
        >
          <SamplePanel
            title="Illustrative site map"
            description="Schematic sample coordinates · not a geographic basemap"
          >
            <SchematicMap
              assets={assets()}
              selectedAssetId={selectedId()}
              onSelect={selectAsset}
            />
            <p class="border-t border-outline px-4 py-2 text-[11px] text-muted">
              {positionedCount()} of {assets().length} filtered sample assets
              have a position. Assets without one remain in the list.
            </p>
          </SamplePanel>
        </div>
        <div class="min-w-0 lg:col-start-2 xl:col-start-auto">
          <MapSelectionPanel
            selected={selected()}
            requestedAssetId={filters().selectedAssetId}
            asOf={props.workbench.asOf}
          />
        </div>
      </div>
      <Show when={assets().length === 0}>
        <p role="status" class="text-xs text-muted">
          No sample assets match the current URL filters. Clear a filter to
          return to the full preview.
        </p>
      </Show>
    </div>
  );
}
