import { For, Show } from 'solid-js';
import type { DemoMapAsset } from '../../demo/map-fixture';

const sites = [
  { label: 'NORTH YARD', x: 78, y: 96 },
  { label: 'CENTRAL DEPOT', x: 388, y: 86 },
  { label: 'EAST BRANCH', x: 755, y: 160 },
  { label: 'SOUTH SERVICE HUB', x: 512, y: 628 },
] as const;

function conditionColor(condition: string): string {
  switch (condition) {
    case 'nominal':
      return 'border-status-nominal text-status-nominal';
    case 'attention':
      return 'border-status-warning text-status-warning';
    case 'critical':
      return 'border-status-critical text-status-critical';
    default:
      return 'border-status-unknown text-status-unknown';
  }
}

/**
 * An accessible illustration of the fixed sample sites. Percent positions are
 * canvas coordinates, not latitude/longitude or a current tracking feed.
 * The companion asset list remains the complete keyboard and text alternative.
 */
export function SchematicMap(props: {
  readonly assets: readonly DemoMapAsset[];
  readonly selectedAssetId: string | null;
  readonly onSelect: (assetId: string) => void;
}) {
  return (
    <div class="relative isolate min-h-[21rem] overflow-hidden bg-canvas sm:min-h-[30rem] xl:min-h-[36rem]">
      <svg
        viewBox="0 0 1000 720"
        preserveAspectRatio="none"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full"
      >
        <rect width="1000" height="720" fill="var(--fi-canvas)" />
        <path
          d="M790 0H1000V720H935C914 625 848 608 861 536C874 457 804 417 838 354C870 294 804 231 822 156C837 95 782 51 790 0Z"
          fill="var(--fi-accent)"
          opacity=".09"
        />
        <path
          d="M0 545C177 456 276 556 418 477S690 484 826 389L925 720H0Z"
          fill="var(--fi-status-nominal)"
          opacity=".035"
        />
        <g fill="none" stroke="var(--fi-outline)" stroke-linecap="round">
          <path
            d="M-30 198C90 196 148 119 270 182S431 318 559 271S731 151 877 207"
            stroke-width="18"
          />
          <path
            d="M84 -28C102 119 180 164 243 264S292 416 451 472S677 586 813 749"
            stroke-width="14"
          />
          <path
            d="M347 -30C389 87 432 148 514 244S637 387 582 475S669 643 710 749"
            stroke-width="12"
          />
        </g>
        <g fill="none" stroke="var(--fi-surface)" stroke-linecap="round">
          <path
            d="M-30 198C90 196 148 119 270 182S431 318 559 271S731 151 877 207"
            stroke-width="10"
          />
          <path
            d="M84 -28C102 119 180 164 243 264S292 416 451 472S677 586 813 749"
            stroke-width="7"
          />
          <path
            d="M347 -30C389 87 432 148 514 244S637 387 582 475S669 643 710 749"
            stroke-width="6"
          />
        </g>
        <g fill="var(--fi-surface)" stroke="var(--fi-muted)" stroke-width="1.5">
          <circle cx="172" cy="151" r="7" />
          <circle cx="270" cy="182" r="7" />
          <circle cx="394" cy="295" r="7" />
          <circle cx="514" cy="244" r="7" />
          <circle cx="643" cy="226" r="7" />
          <circle cx="451" cy="472" r="7" />
          <circle cx="602" cy="516" r="7" />
        </g>
        <For each={sites}>
          {(site) => (
            <text
              x={site.x}
              y={site.y}
              fill="var(--fi-muted)"
              font-size="13"
              font-weight="700"
              letter-spacing="1.2"
            >
              {site.label}
            </text>
          )}
        </For>
      </svg>

      <div class="pointer-events-none absolute top-3 right-3 rounded-md border border-sample-outline bg-surface/95 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
        Schematic · not to scale
      </div>

      <For each={props.assets}>
        {(item) => (
          <Show when={item.location.position}>
            {(position) => {
              const selected = () => props.selectedAssetId === item.asset.id;
              const lastKnown = () => item.location.state === 'last-known';
              return (
                <button
                  type="button"
                  aria-label={
                    'Select ' +
                    item.asset.name +
                    '; ' +
                    item.operations.condition +
                    ' condition; ' +
                    (lastKnown() ? 'last-known' : 'recent') +
                    ' sample position'
                  }
                  aria-pressed={selected()}
                  onClick={() => props.onSelect(item.asset.id)}
                  style={{
                    left: `${String(position().xPercent)}%`,
                    top: `${String(position().yPercent)}%`,
                  }}
                  class={
                    'group absolute z-10 flex min-h-10 min-w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ' +
                    (selected() ? 'z-20' : '')
                  }
                >
                  <span
                    aria-hidden="true"
                    class={
                      'flex size-7 items-center justify-center border-2 bg-surface shadow-sm transition-transform group-hover:scale-110 ' +
                      conditionColor(item.operations.condition) +
                      (lastKnown()
                        ? ' rotate-45 rounded-[0.4rem] border-dashed'
                        : ' rounded-full') +
                      (selected()
                        ? ' ring-2 ring-accent ring-offset-2 ring-offset-canvas'
                        : '')
                    }
                  >
                    <span class={lastKnown() ? '-rotate-45' : ''}>●</span>
                  </span>
                  <span
                    class={
                      'pointer-events-none absolute top-9 left-1/2 max-w-36 -translate-x-1/2 rounded-md border border-outline bg-surface/95 px-2 py-1 text-center text-[11px] font-semibold leading-tight text-foreground shadow-sm ' +
                      (selected()
                        ? 'block'
                        : 'hidden group-hover:block group-focus-visible:block')
                    }
                  >
                    {item.asset.name}
                    <Show when={lastKnown()}>
                      <span class="block font-normal text-muted">
                        Last known
                      </span>
                    </Show>
                  </span>
                </button>
              );
            }}
          </Show>
        )}
      </For>

      <div class="pointer-events-none absolute right-3 bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 rounded-md border border-outline bg-surface/95 px-3 py-2 text-[10px] text-muted shadow-sm">
        <span class="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            class="size-2.5 rounded-full border border-accent bg-surface"
          />
          Recent sample position
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            class="size-2.5 rotate-45 rounded-[2px] border border-dashed border-accent bg-surface"
          />
          Last-known sample position
        </span>
        <span>Unavailable positions appear in the asset list.</span>
      </div>
    </div>
  );
}
