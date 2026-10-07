import { For } from 'solid-js';
import type { DemoFleetOverview } from '../../demo/overview-fixture';
import { SamplePanel } from './SamplePanel';

/** Illustrative utilization/index comparison, independent of telemetry APIs. */
export function Utilization(props: { readonly overview: DemoFleetOverview }) {
  return (
    <SamplePanel
      title="Energy and utilization"
      description="Example normalized indices · not measured energy"
    >
      <div class="flex gap-4 px-4 pt-3 text-[11px] text-muted">
        <span>
          <i class="mr-1 inline-block size-2 rounded-sm bg-accent" />
          Utilization
        </span>
        <span>
          <i class="mr-1 inline-block size-2 rounded-sm bg-status-nominal" />
          Energy index
        </span>
      </div>
      <div class="grid gap-2 px-4 py-3">
        <For each={props.overview.utilization}>
          {(item) => (
            <div class="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-2 text-xs">
              <span class="truncate text-muted">{item.category}</span>
              <div class="grid gap-1">
                <div class="h-2 rounded bg-canvas">
                  <div
                    class="h-full rounded bg-accent"
                    style={{ width: `${item.utilizationPercent}%` }}
                  />
                </div>
                <div class="h-2 rounded bg-canvas">
                  <div
                    class="h-full rounded bg-status-nominal"
                    style={{ width: `${item.energyIndexPercent}%` }}
                  />
                </div>
              </div>
              <strong class="text-right tabular-nums">
                {item.utilizationPercent}%
              </strong>
            </div>
          )}
        </For>
      </div>
      <p class="border-t border-outline px-4 py-2 text-[11px] text-muted">
        Sample indices are visual placeholders; definitions await analytics
        contracts.
      </p>
    </SamplePanel>
  );
}
