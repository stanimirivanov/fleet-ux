import { For, Show } from 'solid-js';
import type { DemoFleetOverview } from '../../demo/overview-fixture';
import { SamplePanel } from './SamplePanel';

const mapLabels = [
  { x: 13, y: 18, name: 'NORTH YARD' },
  { x: 42, y: 15, name: 'CENTRAL DEPOT' },
  { x: 67, y: 27, name: 'EAST BRANCH' },
  { x: 45, y: 84, name: 'SOUTH SERVICE HUB' },
] as const;

function markerColor(condition: string): string {
  switch (condition) {
    case 'critical':
      return 'var(--fi-status-critical)';
    case 'attention':
      return 'var(--fi-status-warning)';
    case 'nominal':
      return 'var(--fi-status-nominal)';
    default:
      return 'var(--fi-status-unknown)';
  }
}

/** Illustrative topology, with no geographic or live-position claim. */
export function FleetMap(props: { readonly overview: DemoFleetOverview }) {
  return (
    <SamplePanel
      title="Fleet map"
      description="Illustrative site positions · not live tracking"
    >
      <div class="relative h-48 overflow-hidden bg-canvas sm:h-52">
        <svg
          viewBox="0 0 800 300"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Illustrative site map; the asset table provides the accessible status list"
          class="h-full w-full"
        >
          <rect width="800" height="300" fill="var(--fi-canvas)" />
          <path
            d="M0 220 C140 170 230 250 335 170 S510 80 800 116"
            fill="none"
            stroke="var(--fi-outline)"
            stroke-width="20"
            opacity=".7"
          />
          <path
            d="M0 220 C140 170 230 250 335 170 S510 80 800 116"
            fill="none"
            stroke="var(--fi-surface)"
            stroke-width="14"
          />
          <path
            d="M80 0 C120 85 205 100 255 155 S405 255 510 300"
            fill="none"
            stroke="var(--fi-outline)"
            stroke-width="11"
            opacity=".8"
          />
          <path
            d="M80 0 C120 85 205 100 255 155 S405 255 510 300"
            fill="none"
            stroke="var(--fi-surface)"
            stroke-width="7"
          />
          <path
            d="M530 0 C560 110 480 170 800 250"
            fill="none"
            stroke="var(--fi-outline)"
            stroke-width="9"
            opacity=".7"
          />
          <path
            d="M530 0 C560 110 480 170 800 250"
            fill="none"
            stroke="var(--fi-surface)"
            stroke-width="5"
          />
          <path
            d="M140 126 L360 74 L545 112 L595 185 L390 238 L140 126"
            fill="none"
            stroke="var(--fi-accent)"
            stroke-width="2"
            stroke-dasharray="7 6"
            opacity=".5"
          />
          <For each={mapLabels}>
            {(label) => (
              <text
                x={label.x * 8}
                y={label.y * 3}
                fill="var(--fi-muted)"
                font-size="10"
                font-weight="700"
                letter-spacing="1"
              >
                {label.name}
              </text>
            )}
          </For>
          <For each={props.overview.assets}>
            {(row) => (
              <Show when={row.operations.mapPosition}>
                {(position) => (
                  <g>
                    <title>
                      {row.asset.name +
                        ': ' +
                        row.operations.condition +
                        ', ' +
                        row.operations.freshness}
                    </title>
                    <circle
                      cx={position().xPercent * 8}
                      cy={position().yPercent * 3}
                      r="13"
                      stroke-dasharray={
                        row.operations.freshness === 'current'
                          ? undefined
                          : '3 3'
                      }
                      fill="var(--fi-surface)"
                      stroke="var(--fi-outline)"
                      stroke-width="1"
                    />
                    <circle
                      cx={position().xPercent * 8}
                      cy={position().yPercent * 3}
                      r="7"
                      fill={markerColor(row.operations.condition)}
                    />
                  </g>
                )}
              </Show>
            )}
          </For>
        </svg>
        <div class="absolute bottom-3 left-3 rounded-md border border-outline bg-surface/95 px-2.5 py-1.5 text-[11px] text-muted shadow-sm">
          {props.overview.counts.positionedCount} of{' '}
          {props.overview.counts.assetCount} sample positions shown
        </div>
      </div>
      <div class="flex flex-wrap gap-x-4 gap-y-1 border-t border-outline px-4 py-2 text-[11px] text-muted">
        <span>
          <i class="mr-1 inline-block size-2 rounded-full bg-status-nominal" />
          Nominal
        </span>
        <span>
          <i class="mr-1 inline-block size-2 rounded-full bg-status-warning" />
          Attention
        </span>
        <span>
          <i class="mr-1 inline-block size-2 rounded-full bg-status-critical" />
          Critical
        </span>
        <span>
          Dashed ring = stale or unknown · missing positions remain in the asset
          list
        </span>
      </div>
    </SamplePanel>
  );
}
