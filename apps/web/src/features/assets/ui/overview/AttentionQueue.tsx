import { For } from 'solid-js';
import { StatusBadge, type StatusTone } from '#shared/ui';
import type { DemoAlert, DemoFleetOverview } from '../../demo/overview-fixture';
import { SamplePanel } from './SamplePanel';

function ageAtSnapshot(alert: DemoAlert, asOf: string): string {
  const minutes = Math.max(
    0,
    Math.floor((Date.parse(asOf) - Date.parse(alert.openedAt)) / 60_000),
  );
  return minutes >= 60
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    : `${minutes}m`;
}

/** A read-only sample queue; there is no alert lifecycle or acknowledgement API. */
export function AttentionQueue(props: {
  readonly overview: DemoFleetOverview;
}) {
  return (
    <SamplePanel
      title="Attention queue"
      description="Age at the fixed sample snapshot"
    >
      <div class="min-w-0 overflow-x-auto">
        <table class="w-full min-w-[340px] border-collapse text-left">
          <caption class="sr-only">Sample attention items</caption>
          <thead class="bg-canvas text-[10px] font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" class="px-4 py-2">
                Asset / issue
              </th>
              <th scope="col" class="px-2 py-2">
                Age
              </th>
              <th scope="col" class="px-3 py-2">
                Severity
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={props.overview.alerts}>
              {(alert) => (
                <tr class="border-t border-outline text-xs">
                  <th scope="row" class="px-4 py-2 text-left font-normal">
                    <span class="block font-semibold">{alert.assetId}</span>
                    <span class="block text-muted">{alert.title}</span>
                  </th>
                  <td class="px-2 py-2 tabular-nums text-muted">
                    {ageAtSnapshot(alert, props.overview.asOf)}
                  </td>
                  <td class="px-3 py-2">
                    <StatusBadge
                      label={
                        alert.severity === 'critical' ? 'Critical' : 'Attention'
                      }
                      tone={
                        (alert.severity === 'critical'
                          ? 'critical'
                          : 'warning') as StatusTone
                      }
                    />
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <p class="border-t border-outline px-4 py-2 text-[11px] text-muted">
        Review only. Alert actions arrive with an audited backend lifecycle.
      </p>
    </SamplePanel>
  );
}
