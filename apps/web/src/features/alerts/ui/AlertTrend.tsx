import { createMemo, For, Show } from 'solid-js';
import type { AlertSignalEvidence } from '../model/alert-triage';
import { AlertPanel } from './AlertPanel';
import { projectAlertChart } from './alert-chart';
import { formatAlertTime } from './alert-format';

/** Fixed evidence trend with explicit gaps and a keyboard-readable table. */
export function AlertTrend(props: {
  readonly evidence: AlertSignalEvidence | null;
}) {
  const chart = createMemo(() =>
    projectAlertChart(
      props.evidence?.series ?? [],
      props.evidence?.referenceBand?.lower ?? null,
      props.evidence?.referenceBand?.upper ?? null,
    ),
  );
  return (
    <AlertPanel
      title="Evidence trend"
      description={
        props.evidence
          ? `${props.evidence.label} · fixed sample events, UTC`
          : 'No signal evidence is modeled for this sample incident'
      }
    >
      <Show
        when={props.evidence}
        fallback={<p class="p-5 text-sm text-muted">No trend is available.</p>}
      >
        {(evidence) => (
          <div class="p-4">
            <div class="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
              <span>
                <span aria-hidden="true" class="mr-1 text-accent">
                  ━━
                </span>
                Observed
              </span>
              <span>
                <span aria-hidden="true" class="mr-1 text-status-warning">
                  ┄┄
                </span>
                Reference boundary
              </span>
              <span>Gaps are not zero</span>
            </div>
            <Show
              when={chart().points.length > 0}
              fallback={
                <p class="py-10 text-center text-sm text-muted">
                  No numeric readings in this sample window.
                </p>
              }
            >
              <svg
                viewBox="0 0 640 160"
                preserveAspectRatio="none"
                role="img"
                aria-label={`Sample evidence trend for ${evidence().label}; table follows`}
                class="h-40 w-full"
              >
                <For each={[0, 1, 2, 3]}>
                  {(step) => (
                    <line
                      x1="44"
                      x2="596"
                      y1={12 + step * 38}
                      y2={12 + step * 38}
                      stroke="var(--fi-outline)"
                      stroke-width="1"
                    />
                  )}
                </For>
                <Show when={chart().lowerY !== null && chart().upperY !== null}>
                  <rect
                    x="44"
                    y={chart().upperY ?? 0}
                    width="552"
                    height={Math.max(
                      0,
                      (chart().lowerY ?? 0) - (chart().upperY ?? 0),
                    )}
                    fill="var(--fi-status-nominal)"
                    opacity="0.09"
                  />
                </Show>
                <For
                  each={[chart().lowerY, chart().upperY].filter(
                    (value) => value !== null,
                  )}
                >
                  {(boundary) => (
                    <line
                      x1="44"
                      x2="596"
                      y1={boundary}
                      y2={boundary}
                      stroke="var(--fi-status-warning)"
                      stroke-width="2"
                      stroke-dasharray="5 4"
                    />
                  )}
                </For>
                <For each={chart().gaps}>
                  {(x) => (
                    <line
                      x1={x}
                      x2={x}
                      y1="12"
                      y2="126"
                      stroke="var(--fi-status-warning)"
                      stroke-width="4"
                      opacity="0.55"
                    />
                  )}
                </For>
                <For each={chart().paths}>
                  {(path) => (
                    <path
                      d={path}
                      fill="none"
                      stroke="var(--fi-accent)"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  )}
                </For>
                <text x="5" y="20" fill="var(--fi-muted)" font-size="10">
                  {Math.round(chart().max)}
                </text>
                <text x="5" y="127" fill="var(--fi-muted)" font-size="10">
                  {Math.round(chart().min)}
                </text>
                <text x="44" y="152" fill="var(--fi-muted)" font-size="10">
                  First event
                </text>
                <text
                  x="596"
                  y="152"
                  text-anchor="end"
                  fill="var(--fi-muted)"
                  font-size="10"
                >
                  Last event
                </text>
              </svg>
            </Show>
            <details class="mt-3 border-t border-outline pt-3 text-xs">
              <summary class="cursor-pointer font-semibold text-accent">
                View readings as a table
              </summary>
              <div class="mt-2 max-h-44 overflow-auto">
                <table class="w-full text-left">
                  <caption class="sr-only">
                    Sample evidence readings for {evidence().label}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" class="py-1">
                        Event time (UTC)
                      </th>
                      <th scope="col" class="py-1">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={evidence().series}>
                      {(point) => (
                        <tr class="border-t border-outline">
                          <td class="py-1">{formatAlertTime(point.at)}</td>
                          <td class="py-1 tabular-nums">
                            {point.value === null
                              ? 'Gap'
                              : `${point.value} ${evidence().unit}`}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        )}
      </Show>
    </AlertPanel>
  );
}
