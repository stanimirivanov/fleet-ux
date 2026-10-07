import { createMemo, For, Show } from 'solid-js';
import type {
  DemoEvidenceGap,
  DemoSignal,
  DemoSignalPoint,
} from '../../demo/inspector-fixture';
import { formatSampleTime } from './inspector-format';

export type HistoryWindow = '1h' | '6h' | '24h';

const WINDOW_HOURS: Readonly<Record<HistoryWindow, number>> = {
  '1h': 1,
  '6h': 6,
  '24h': 24,
};

const PLOT = { left: 48, right: 620, top: 12, bottom: 96 } as const;

function lineSegments(
  points: readonly DemoSignalPoint[],
  x: (at: string) => number,
  y: (value: number) => number,
): string[] {
  const segments: string[] = [];
  let current = '';
  for (const point of points) {
    if (point.value === null) {
      if (current) segments.push(current);
      current = '';
      continue;
    }
    const coordinate = `${Math.round(x(point.at))} ${Math.round(y(point.value))}`;
    current += (current ? ' L ' : 'M ') + coordinate;
  }
  if (current) segments.push(current);
  return segments;
}

/** A small dependency-free SVG plot; null points break the line, never interpolate it. */
function SignalPlot(props: {
  readonly signal: DemoSignal;
  readonly asOf: string;
  readonly window: HistoryWindow;
  readonly gaps: readonly DemoEvidenceGap[];
}) {
  const geometry = createMemo(() => {
    const end = Date.parse(props.asOf);
    const start = end - WINDOW_HOURS[props.window] * 3_600_000;
    const points = props.signal.series.filter((point) => {
      const at = Date.parse(point.at);
      return at >= start && at <= end;
    });
    const values = points.flatMap((point) =>
      point.value === null ? [] : [point.value],
    );
    const band = props.signal.referenceBand;
    const bounds = band ? [...values, band.min, band.max] : values;
    const low = bounds.length > 0 ? Math.min(...bounds) : 0;
    const high = bounds.length > 0 ? Math.max(...bounds) : 1;
    const span = Math.max(high - low, 1);
    const minimum = low - span * 0.08;
    const maximum = high + span * 0.08;
    const x = (at: string) =>
      PLOT.left +
      ((Date.parse(at) - start) / (end - start)) * (PLOT.right - PLOT.left);
    const y = (value: number) =>
      PLOT.bottom -
      ((value - minimum) / (maximum - minimum)) * (PLOT.bottom - PLOT.top);
    return {
      points,
      start,
      end,
      minimum,
      maximum,
      x,
      y,
      segments: lineSegments(points, x, y),
      gaps: props.gaps.filter(
        (gap) =>
          Date.parse(gap.endAt) >= start && Date.parse(gap.startAt) <= end,
      ),
    };
  });

  return (
    <article class="min-w-0 rounded-md border border-outline bg-surface p-3">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h3 class="text-xs font-semibold">{props.signal.label}</h3>
        <span class="text-[11px] text-muted">
          {props.signal.referenceBand
            ? 'Illustrative band ' +
              props.signal.referenceBand.min +
              '–' +
              props.signal.referenceBand.max +
              ' ' +
              (props.signal.unit ?? '')
            : 'No reference band'}
        </span>
      </div>
      <Show
        when={geometry().points.some((point) => point.value !== null)}
        fallback={
          <p role="status" class="py-8 text-center text-xs text-muted">
            No observations in this sample time window.
          </p>
        }
      >
        <svg
          viewBox="0 0 640 126"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Sample history for ${props.signal.label}; table follows`}
          class="mt-2 h-32 w-full"
        >
          <For each={[0, 1, 2, 3]}>
            {(step) => (
              <line
                x1={PLOT.left}
                x2={PLOT.right}
                y1={PLOT.top + (step * (PLOT.bottom - PLOT.top)) / 3}
                y2={PLOT.top + (step * (PLOT.bottom - PLOT.top)) / 3}
                stroke="var(--fi-outline)"
                stroke-width="1"
              />
            )}
          </For>
          <Show when={props.signal.referenceBand}>
            {(band) => (
              <rect
                x={PLOT.left}
                y={geometry().y(band().max)}
                width={PLOT.right - PLOT.left}
                height={Math.max(
                  0,
                  geometry().y(band().min) - geometry().y(band().max),
                )}
                fill="var(--fi-status-nominal)"
                opacity="0.1"
              />
            )}
          </Show>
          <For each={geometry().gaps}>
            {(gap) => (
              <rect
                x={Math.max(PLOT.left, geometry().x(gap.startAt))}
                y={PLOT.top}
                width={Math.max(
                  2,
                  Math.min(PLOT.right, geometry().x(gap.endAt)) -
                    Math.max(PLOT.left, geometry().x(gap.startAt)),
                )}
                height={PLOT.bottom - PLOT.top}
                fill="var(--fi-status-warning)"
                opacity="0.18"
              />
            )}
          </For>
          <For each={geometry().segments}>
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
          <For each={geometry().points.filter((point) => point.value !== null)}>
            {(point) => (
              <circle
                cx={geometry().x(point.at)}
                cy={geometry().y(point.value ?? 0)}
                r="3"
                fill="var(--fi-accent)"
                stroke="var(--fi-surface)"
                stroke-width="1.5"
              />
            )}
          </For>
          <text x="4" y="19" fill="var(--fi-muted)" font-size="10">
            {Math.round(geometry().maximum)}
          </text>
          <text x="4" y="98" fill="var(--fi-muted)" font-size="10">
            {Math.round(geometry().minimum)}
          </text>
          <text x={PLOT.left} y="118" fill="var(--fi-muted)" font-size="10">
            {props.window} ago
          </text>
          <text
            x={PLOT.right}
            y="118"
            fill="var(--fi-muted)"
            font-size="10"
            text-anchor="end"
          >
            Snapshot
          </text>
        </svg>
      </Show>
      <details class="mt-2 border-t border-outline pt-2 text-xs text-muted">
        <summary class="cursor-pointer font-medium text-accent">
          View readings as a table
        </summary>
        <div class="mt-2 max-h-40 overflow-auto">
          <table class="w-full text-left">
            <caption class="sr-only">
              Sample readings for {props.signal.label}
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
              <For each={geometry().points}>
                {(point) => (
                  <tr class="border-t border-outline">
                    <td class="py-1">{formatSampleTime(point.at)}</td>
                    <td class="py-1 tabular-nums">
                      {point.value ?? 'Gap'}{' '}
                      {point.value === null ? '' : props.signal.unit}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </details>
    </article>
  );
}

/** All plots share one fixed snapshot and selectable time window. */
export function SignalHistory(props: {
  readonly signals: readonly DemoSignal[];
  readonly gaps: readonly DemoEvidenceGap[];
  readonly asOf: string;
  readonly window: HistoryWindow;
  readonly onWindowChange: (window: HistoryWindow) => void;
}) {
  return (
    <div class="grid gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 class="text-sm font-semibold">Telemetry history</h3>
          <p class="text-[11px] text-muted">
            Aligned to one sample snapshot · shaded gaps are missing evidence
          </p>
        </div>
        <fieldset
          aria-label="History window"
          class="inline-flex rounded-md border border-outline bg-surface p-0.5"
        >
          <For each={['1h', '6h', '24h'] as const}>
            {(window) => (
              <button
                type="button"
                aria-pressed={props.window === window}
                onClick={() => props.onWindowChange(window)}
                class={
                  'rounded px-2.5 py-1 text-[11px] font-semibold ' +
                  (props.window === window
                    ? 'bg-accent text-on-accent'
                    : 'text-muted hover:text-foreground')
                }
              >
                {window}
              </button>
            )}
          </For>
        </fieldset>
      </div>
      <For each={props.signals}>
        {(signal) => (
          <SignalPlot
            signal={signal}
            asOf={props.asOf}
            window={props.window}
            gaps={props.gaps.filter((gap) => gap.signalId === signal.id)}
          />
        )}
      </For>
    </div>
  );
}
