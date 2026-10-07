import { createSignal, For, Show } from 'solid-js';
import { StatusBadge, type StatusTone } from '#shared/ui';
import type { DemoMapAsset } from '../../demo/map-fixture';
import type { MapWorkbenchFilters } from '../../model/map-workbench';
import { SamplePanel } from '../overview/SamplePanel';
import { MapFilters } from './MapFilters';
import { locationAge } from './map-format';

type FilterKey = keyof Omit<MapWorkbenchFilters, 'selectedAssetId'>;

function conditionTone(
  condition: DemoMapAsset['operations']['condition'],
): StatusTone {
  return condition === 'attention' ? 'warning' : condition;
}

function locationLabel(row: DemoMapAsset, asOf: string): string {
  return row.location.state === 'unavailable'
    ? 'Position unavailable'
    : locationAge(row.location, asOf);
}

function AssetListRow(props: {
  readonly row: DemoMapAsset;
  readonly selected: boolean;
  readonly asOf: string;
  readonly onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-label={`Select ${props.row.asset.name}`}
        aria-pressed={props.selected}
        onClick={props.onSelect}
        class={
          'grid w-full gap-1 rounded-md border px-3 py-2 text-left text-xs transition-colors ' +
          (props.selected
            ? 'border-sample-outline bg-accent/10'
            : 'border-transparent hover:border-outline hover:bg-surface')
        }
      >
        <span class="flex flex-wrap items-center justify-between gap-2">
          <strong class="text-sm">{props.row.asset.name}</strong>
          <StatusBadge
            label={props.row.operations.condition}
            tone={conditionTone(props.row.operations.condition)}
          />
        </span>
        <span class="font-mono text-[10px] text-muted">
          {props.row.asset.id} · {props.row.asset.assetType.id}
        </span>
        <span class="text-[11px] text-muted">
          {props.row.location.siteLabel} ·{' '}
          {locationLabel(props.row, props.asOf)}
        </span>
      </button>
    </li>
  );
}

function AssetTable(props: {
  readonly assets: readonly DemoMapAsset[];
  readonly selectedId: string | null;
  readonly asOf: string;
  readonly onSelect: (assetId: string) => void;
}) {
  return (
    <div class="min-w-0 overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
      <table class="w-full min-w-[360px] border-collapse text-left text-xs">
        <caption class="sr-only">Sample assets and position evidence</caption>
        <thead class="bg-canvas text-[10px] font-semibold uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" class="px-3 py-2">
              Asset
            </th>
            <th scope="col" class="px-2 py-2">
              Condition
            </th>
            <th scope="col" class="px-3 py-2">
              Position
            </th>
          </tr>
        </thead>
        <tbody>
          <For each={props.assets}>
            {(row) => (
              <tr
                class={
                  'border-t border-outline ' +
                  (row.asset.id === props.selectedId ? 'bg-accent/10' : '')
                }
              >
                <th scope="row" class="px-3 py-2 text-left font-normal">
                  <button
                    type="button"
                    aria-label={`Select ${row.asset.name}`}
                    aria-pressed={row.asset.id === props.selectedId}
                    onClick={() => props.onSelect(row.asset.id)}
                    class="font-semibold text-accent hover:underline"
                  >
                    {row.asset.name}
                  </button>
                  <span class="block font-mono text-[10px] text-muted">
                    {row.asset.id}
                  </span>
                </th>
                <td class="px-2 py-2">{row.operations.condition}</td>
                <td class="px-3 py-2 text-muted">
                  {locationLabel(row, props.asOf)}
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

/** Keyboard asset selection and a dense table provide parity with the map. */
export function AssetMapList(props: {
  readonly allAssets: readonly DemoMapAsset[];
  readonly assets: readonly DemoMapAsset[];
  readonly filters: MapWorkbenchFilters;
  readonly selectedId: string | null;
  readonly asOf: string;
  readonly onFilterChange: (key: FilterKey, value: string) => void;
  readonly onSelect: (assetId: string) => void;
}) {
  const [view, setView] = createSignal<'list' | 'table'>('list');

  return (
    <SamplePanel
      title="Asset list"
      description="Every asset stays reachable without the map"
      class="lg:flex lg:h-[calc(100dvh-11.5rem)] lg:max-h-[48rem] lg:min-h-[37rem] lg:flex-col xl:min-h-[41rem]"
    >
      <MapFilters
        assets={props.allAssets}
        filters={props.filters}
        onChange={props.onFilterChange}
      />
      <div class="flex flex-wrap items-center justify-between gap-2 border-t border-outline px-4 py-2 lg:shrink-0">
        <p class="text-[11px] text-muted">
          {props.assets.length} of {props.allAssets.length} sample assets
        </p>
        <fieldset class="inline-flex rounded-md border border-outline bg-surface p-0.5">
          <legend class="sr-only">Asset display</legend>
          <button
            type="button"
            aria-pressed={view() === 'list'}
            onClick={() => setView('list')}
            class={
              'rounded px-2.5 py-1 text-[11px] font-semibold ' +
              (view() === 'list' ? 'bg-accent text-on-accent' : 'text-muted')
            }
          >
            List
          </button>
          <button
            type="button"
            aria-pressed={view() === 'table'}
            onClick={() => setView('table')}
            class={
              'rounded px-2.5 py-1 text-[11px] font-semibold ' +
              (view() === 'table' ? 'bg-accent text-on-accent' : 'text-muted')
            }
          >
            Table
          </button>
        </fieldset>
      </div>
      <Show
        when={props.assets.length > 0}
        fallback={
          <p
            role="status"
            class="border-t border-outline px-4 py-6 text-sm text-muted"
          >
            No sample assets match these filters.
          </p>
        }
      >
        <Show
          when={view() === 'list'}
          fallback={
            <AssetTable
              assets={props.assets}
              selectedId={props.selectedId}
              asOf={props.asOf}
              onSelect={props.onSelect}
            />
          }
        >
          <ul
            aria-label="Sample map assets"
            class="grid max-h-[35rem] content-start gap-1 overflow-y-auto border-t border-outline p-2 lg:min-h-0 lg:max-h-none lg:flex-1"
          >
            <For each={props.assets}>
              {(row) => (
                <AssetListRow
                  row={row}
                  selected={row.asset.id === props.selectedId}
                  asOf={props.asOf}
                  onSelect={() => props.onSelect(row.asset.id)}
                />
              )}
            </For>
          </ul>
        </Show>
      </Show>
      <p class="border-t border-outline px-4 py-2 text-[11px] text-muted lg:mt-auto lg:shrink-0">
        Position-unavailable assets remain in this list. Filters apply only to
        the complete local sample set.
      </p>
    </SamplePanel>
  );
}
