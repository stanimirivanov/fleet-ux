import { A, useSearchParams } from '@solidjs/router';
import { createMemo, For, Show } from 'solid-js';
import { StatusBadge, type StatusTone, TextLink } from '#shared/ui';
import type {
  DemoAssetRow,
  DemoCondition,
  DemoFleetOverview,
} from '../../demo/overview-fixture';
import { assetInspectorSampleHref } from '../../model/asset-preview-url';
import { SamplePanel } from './SamplePanel';

function conditionTone(condition: DemoCondition): StatusTone {
  if (condition === 'attention') return 'warning';
  return condition;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function AssetRow(props: { readonly row: DemoAssetRow }) {
  return (
    <tr class="border-t border-outline text-xs">
      <th scope="row" class="px-4 py-2 text-left font-normal">
        <A
          href={assetInspectorSampleHref(props.row.asset.id)}
          aria-label={`Inspect ${props.row.asset.name}`}
          class="block font-semibold text-accent underline-offset-2 hover:underline focus-visible:underline"
        >
          {props.row.asset.name}
        </A>
        <span class="font-mono text-[11px] text-muted">
          {props.row.asset.id}
        </span>
      </th>
      <td class="px-3 py-2 text-muted">{props.row.asset.assetType.id}</td>
      <td class="px-3 py-2 text-muted">{props.row.operations.siteLabel}</td>
      <td class="px-3 py-2">
        <StatusBadge
          label={titleCase(props.row.operations.condition)}
          tone={conditionTone(props.row.operations.condition)}
        />
      </td>
      <td class="px-3 py-2 text-muted">
        {titleCase(props.row.operations.connectivity)}
      </td>
      <td class="px-3 py-2 text-muted">
        {titleCase(props.row.operations.freshness)}
      </td>
    </tr>
  );
}

/** Search and facet filtering apply only to the complete local sample set. */
export function AssetDiscovery(props: {
  readonly overview: DemoFleetOverview;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = () =>
    typeof searchParams.q === 'string' ? searchParams.q : '';
  const condition = () =>
    typeof searchParams.condition === 'string' ? searchParams.condition : '';
  const assetType = () =>
    typeof searchParams.type === 'string' ? searchParams.type : '';
  const connectivity = () =>
    typeof searchParams.connectivity === 'string'
      ? searchParams.connectivity
      : '';
  const assetTypes = () =>
    [
      ...new Set(props.overview.assets.map((row) => row.asset.assetType.id)),
    ].sort();
  const filtered = createMemo(() =>
    props.overview.assets.filter((row) => {
      const matchQuery = (
        row.asset.name +
        ' ' +
        row.asset.id +
        ' ' +
        row.asset.assetType.id +
        ' ' +
        row.operations.siteLabel
      )
        .toLocaleLowerCase()
        .includes(query().trim().toLocaleLowerCase());
      return (
        matchQuery &&
        (!condition() || row.operations.condition === condition()) &&
        (!assetType() || row.asset.assetType.id === assetType()) &&
        (!connectivity() || row.operations.connectivity === connectivity())
      );
    }),
  );
  const shown = createMemo(() => filtered().slice(0, 5));

  return (
    <SamplePanel
      title="Asset discovery"
      description="Condition, connection, and evidence freshness are separate"
      action={
        <TextLink href="/assets?preview=sample">View all assets</TextLink>
      }
    >
      <div class="flex flex-wrap items-end gap-2 px-4 py-2 sm:px-5">
        <label class="min-w-44 flex-1 text-[11px] font-medium text-muted">
          Search assets
          <input
            aria-label="Search assets"
            type="search"
            value={query()}
            onInput={(event) =>
              setSearchParams(
                { q: event.currentTarget.value || undefined },
                { replace: true },
              )
            }
            placeholder="Name, ID, type, or site"
            class="mt-1 block h-9 w-full rounded-md border border-outline bg-surface px-3 text-xs text-foreground placeholder:text-muted"
          />
        </label>
        <label class="text-[11px] font-medium text-muted">
          Type
          <select
            aria-label="Type"
            value={assetType()}
            onChange={(event) =>
              setSearchParams(
                { type: event.currentTarget.value || undefined },
                { replace: true },
              )
            }
            class="mt-1 block h-9 min-w-32 rounded-md border border-outline bg-surface px-2 text-xs text-foreground"
          >
            <option value="">All types</option>
            <For each={assetTypes()}>
              {(type) => <option value={type}>{type}</option>}
            </For>
          </select>
        </label>
        <label class="text-[11px] font-medium text-muted">
          Condition
          <select
            aria-label="Condition"
            value={condition()}
            onChange={(event) =>
              setSearchParams(
                { condition: event.currentTarget.value || undefined },
                { replace: true },
              )
            }
            class="mt-1 block h-9 min-w-32 rounded-md border border-outline bg-surface px-2 text-xs text-foreground"
          >
            <option value="">All conditions</option>
            <option value="nominal">Nominal</option>
            <option value="attention">Attention</option>
            <option value="critical">Critical</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label class="text-[11px] font-medium text-muted">
          Connectivity
          <select
            aria-label="Connectivity"
            value={connectivity()}
            onChange={(event) =>
              setSearchParams(
                { connectivity: event.currentTarget.value || undefined },
                { replace: true },
              )
            }
            class="mt-1 block h-9 min-w-32 rounded-md border border-outline bg-surface px-2 text-xs text-foreground"
          >
            <option value="">All connections</option>
            <option value="connected">Connected</option>
            <option value="disconnected">Disconnected</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
      </div>
      <div class="min-w-0 overflow-x-auto">
        <table class="w-full min-w-[690px] border-collapse text-left">
          <caption class="sr-only">
            Sample fleet assets with separate condition, connectivity, and
            freshness states
          </caption>
          <thead class="bg-canvas text-[10px] font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" class="px-4 py-2">
                Asset
              </th>
              <th scope="col" class="px-3 py-2">
                Type
              </th>
              <th scope="col" class="px-3 py-2">
                Site
              </th>
              <th scope="col" class="px-3 py-2">
                Condition
              </th>
              <th scope="col" class="px-3 py-2">
                Connection
              </th>
              <th scope="col" class="px-3 py-2">
                Freshness
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={shown()}>{(row) => <AssetRow row={row} />}</For>
          </tbody>
        </table>
      </div>
      <Show when={filtered().length === 0}>
        <p role="status" class="px-4 py-5 text-sm text-muted">
          No sample assets match these filters.
        </p>
      </Show>
      <div class="border-t border-outline px-4 py-2 text-[11px] text-muted">
        Showing {shown().length} of {filtered().length} matching sample assets.
        Filters apply locally to this preview.
      </div>
    </SamplePanel>
  );
}
