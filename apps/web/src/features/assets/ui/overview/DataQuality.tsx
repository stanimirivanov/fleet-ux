import { For } from 'solid-js';
import type {
  DemoFleetOverview,
  DemoTrendPoint,
} from '../../demo/overview-fixture';
import { SamplePanel } from './SamplePanel';

function linePoints(
  points: readonly DemoTrendPoint[],
  value: (point: DemoTrendPoint) => number,
  maximum: number,
): string {
  if (points.length < 2) return '';
  return points
    .map(
      (point, index) =>
        28 +
        (index * 270) / (points.length - 1) +
        ',' +
        (116 - (value(point) / maximum) * 88),
    )
    .join(' ');
}

/** Fixed-snapshot coverage trend; its tabular alternative exposes each value. */
export function DataQuality(props: { readonly overview: DemoFleetOverview }) {
  return (
    <SamplePanel
      title="Data quality"
      description="Seven-day illustrative coverage"
    >
      <div class="px-4 pt-3">
        <div class="flex gap-4 text-[11px] text-muted">
          <span>
            <i class="mr-1 inline-block h-0.5 w-3 align-middle bg-accent" />
            Reporting
          </span>
          <span>
            <i class="mr-1 inline-block h-0.5 w-3 align-middle bg-status-warning" />
            Attention
          </span>
        </div>
        <svg
          viewBox="0 0 330 145"
          role="img"
          aria-label="Sample seven-day reporting and attention trend"
          class="mt-1 h-24 w-full"
        >
          <path
            d="M28 28 H305 M28 72 H305 M28 116 H305"
            stroke="var(--fi-outline)"
            stroke-width="1"
          />
          <polyline
            points={linePoints(
              props.overview.trend,
              (point) => point.reportingAssets,
              props.overview.counts.assetCount,
            )}
            fill="none"
            stroke="var(--fi-accent)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <polyline
            points={linePoints(
              props.overview.trend,
              (point) => point.requiringAttention,
              props.overview.counts.assetCount,
            )}
            fill="none"
            stroke="var(--fi-status-warning)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <text x="28" y="139" fill="var(--fi-muted)" font-size="10">
            {props.overview.trend[0]?.day ?? ''}
          </text>
          <text x="252" y="139" fill="var(--fi-muted)" font-size="10">
            {props.overview.trend.at(-1)?.day ?? ''}
          </text>
        </svg>
        <table class="sr-only">
          <caption>Sample daily counts for data-quality trend</caption>
          <thead>
            <tr>
              <th>Day</th>
              <th>Reporting</th>
              <th>Attention</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.overview.trend}>
              {(point) => (
                <tr>
                  <th>{point.day}</th>
                  <td>{point.reportingAssets}</td>
                  <td>{point.requiringAttention}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <div class="flex gap-6 border-t border-outline px-4 py-2 text-xs">
        <p>
          <strong class="block text-lg tabular-nums">
            {props.overview.counts.currentEvidenceCount}
          </strong>
          <span class="text-muted">Current evidence</span>
        </p>
        <p>
          <strong class="block text-lg tabular-nums">
            {props.overview.counts.assetCount -
              props.overview.counts.currentEvidenceCount}
          </strong>
          <span class="text-muted">Stale / unknown</span>
        </p>
      </div>
    </SamplePanel>
  );
}
