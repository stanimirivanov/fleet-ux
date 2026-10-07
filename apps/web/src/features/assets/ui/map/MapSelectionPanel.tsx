import { Show } from 'solid-js';
import { ButtonLink, StatusBadge, type StatusTone } from '#shared/ui';
import type { DemoMapAsset } from '../../demo/map-fixture';
import { assetInspectorSampleHref } from '../../model/asset-preview-url';
import { SamplePanel } from '../overview/SamplePanel';
import { formatMapTime, locationAge } from './map-format';

function conditionTone(
  value: DemoMapAsset['operations']['condition'],
): StatusTone {
  return value === 'attention' ? 'warning' : value;
}

function connectionTone(
  value: DemoMapAsset['operations']['connectivity'],
): StatusTone {
  return value === 'connected'
    ? 'nominal'
    : value === 'disconnected'
      ? 'warning'
      : 'unknown';
}

function freshnessTone(
  value: DemoMapAsset['operations']['freshness'],
): StatusTone {
  return value === 'current'
    ? 'nominal'
    : value === 'stale'
      ? 'warning'
      : 'unknown';
}

function locationTone(value: DemoMapAsset['location']['state']): StatusTone {
  return value === 'recent'
    ? 'nominal'
    : value === 'last-known'
      ? 'warning'
      : 'unknown';
}

function capitalized(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');
}

/** In-place context keeps map selection distinct from the full asset inspector. */
export function MapSelectionPanel(props: {
  readonly selected: DemoMapAsset | null;
  readonly requestedAssetId: string | null;
  readonly asOf: string;
}) {
  return (
    <SamplePanel
      title="Selected asset"
      description="Location evidence at the fixed sample cutoff"
    >
      <Show when={props.selected}>
        {(selected) => (
          <div class="grid gap-4 p-4 text-xs sm:p-5">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-accent">
                Physical asset
              </p>
              <h2 class="mt-1 text-xl font-semibold">
                {selected().asset.name}
              </h2>
              <p class="mt-1 break-all font-mono text-[11px] text-muted">
                {selected().asset.id} · {selected().asset.assetType.id}
              </p>
              <p class="mt-1 text-muted">{selected().location.siteLabel}</p>
            </div>
            <dl class="grid gap-3 border-t border-outline pt-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <dt class="text-muted">Asset condition</dt>
                <dd>
                  <StatusBadge
                    label={capitalized(selected().operations.condition)}
                    tone={conditionTone(selected().operations.condition)}
                  />
                </dd>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-2">
                <dt class="text-muted">Device connection</dt>
                <dd>
                  <StatusBadge
                    label={capitalized(selected().operations.connectivity)}
                    tone={connectionTone(selected().operations.connectivity)}
                  />
                </dd>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-2">
                <dt class="text-muted">Telemetry freshness</dt>
                <dd>
                  <StatusBadge
                    label={capitalized(selected().operations.freshness)}
                    tone={freshnessTone(selected().operations.freshness)}
                  />
                </dd>
              </div>
            </dl>
            <section class="border-t border-outline pt-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h3 class="font-semibold">Position evidence</h3>
                <StatusBadge
                  label={capitalized(selected().location.state)}
                  tone={locationTone(selected().location.state)}
                />
              </div>
              <p class="mt-2 font-medium">
                {locationAge(selected().location, props.asOf)}
              </p>
              <dl class="mt-3 grid gap-2 text-muted">
                <div>
                  <dt class="inline">Observed · </dt>
                  <dd class="inline">
                    {formatMapTime(selected().location.observedAt)}
                  </dd>
                </div>
                <div>
                  <dt class="inline">Received · </dt>
                  <dd class="inline">
                    {formatMapTime(selected().location.receivedAt)}
                  </dd>
                </div>
                <div>
                  <dt class="inline">Source · </dt>
                  <dd class="inline">
                    {selected().location.sourceLabel ?? 'Unavailable'}
                  </dd>
                </div>
                <div>
                  <dt class="inline">Quality · </dt>
                  <dd class="inline">
                    {capitalized(selected().location.quality)}
                  </dd>
                </div>
              </dl>
              <p class="mt-3 text-[11px] text-muted">
                The marker uses illustrative canvas coordinates, not a
                geographic location.
              </p>
            </section>
            <ButtonLink href={assetInspectorSampleHref(selected().asset.id)}>
              Open asset inspector
            </ButtonLink>
            <p class="text-[11px] text-muted">
              Full sample inspector evidence is available for locomotive 417 and
              trailer 11; other assets show identity only.
            </p>
          </div>
        )}
      </Show>
      <Show when={!props.selected}>
        <div role="status" class="p-5 text-sm text-muted">
          {props.requestedAssetId !== ''
            ? 'The selected asset is not in the current filtered set. Adjust the filters or choose another asset.'
            : 'No positioned asset is available in these results. Choose an asset from the list to inspect its evidence.'}
        </div>
      </Show>
    </SamplePanel>
  );
}
