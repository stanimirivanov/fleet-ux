import { For } from 'solid-js';
import type { DemoFleetOverview } from '../../demo/overview-fixture';

interface Metric {
  readonly label: string;
  readonly value: number;
  readonly detail: string;
  readonly bars: readonly number[];
}

export function FleetMetrics(props: { readonly overview: DemoFleetOverview }) {
  const metrics = (): readonly Metric[] => [
    {
      label: 'Reporting assets',
      value: props.overview.counts.currentEvidenceCount,
      detail: 'Current evidence in sample snapshot',
      bars: props.overview.trend.map((point) => point.reportingAssets),
    },
    {
      label: 'Need attention',
      value: props.overview.counts.requiringAttentionCount,
      detail: 'Attention or critical condition',
      bars: props.overview.trend.map((point) => point.requiringAttention),
    },
    {
      label: 'Stale or unknown',
      value:
        props.overview.counts.assetCount -
        props.overview.counts.currentEvidenceCount,
      detail: 'Evidence freshness, not asset health',
      bars: props.overview.trend.map((point) =>
        Math.max(0, props.overview.counts.assetCount - point.reportingAssets),
      ),
    },
  ];

  return (
    <section aria-label="Fleet metrics" class="grid gap-2 sm:grid-cols-3">
      <For each={metrics()}>
        {(metric) => (
          <article class="rounded-lg border border-sample-outline border-t-2 border-t-accent/35 bg-sample-surface px-3 py-2 shadow-sm">
            <div class="flex items-start justify-between gap-2">
              <p class="text-xs font-medium text-muted">{metric.label}</p>
              <span class="text-[10px] font-semibold uppercase tracking-wide text-accent">
                Sample data
              </span>
            </div>
            <div class="mt-1 flex items-end justify-between gap-3">
              <strong class="text-2xl font-semibold tabular-nums leading-none">
                {metric.value}
              </strong>
              <div class="flex h-6 items-end gap-1" aria-hidden="true">
                <For each={metric.bars}>
                  {(height) => (
                    <span
                      class="w-1.5 rounded-t bg-accent/45"
                      style={{ height: `${Math.max(15, height * 15)}%` }}
                    />
                  )}
                </For>
              </div>
            </div>
            <p class="mt-1 text-[11px] leading-4 text-muted">{metric.detail}</p>
          </article>
        )}
      </For>
    </section>
  );
}
