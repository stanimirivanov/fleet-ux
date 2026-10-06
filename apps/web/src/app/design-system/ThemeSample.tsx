import { For } from 'solid-js';
import { StatusBadge, type StatusTone } from '#shared/ui';

type PreviewTheme = 'light' | 'dark';

const STATUS_SAMPLES: ReadonlyArray<{
  label: string;
  badge: string;
  tone: StatusTone;
}> = [
  { label: 'Asset condition', badge: 'Attention', tone: 'warning' },
  { label: 'Gateway connection', badge: 'Connected', tone: 'nominal' },
  { label: 'Telemetry freshness', badge: 'Unknown', tone: 'unknown' },
  { label: 'Alert severity', badge: 'Critical', tone: 'critical' },
];

function StatusRow(props: { label: string; badge: string; tone: StatusTone }) {
  return (
    <div class="flex min-h-14 items-center justify-between gap-4 py-3">
      <dt class="text-sm text-muted">{props.label}</dt>
      <dd>
        <StatusBadge label={props.badge} tone={props.tone} />
      </dd>
    </div>
  );
}

/** Isolated theme specimen; no live asset condition is implied. */
export function ThemeSample(props: { theme: PreviewTheme }) {
  return (
    <article
      data-theme={props.theme}
      class="rounded-panel border border-outline bg-canvas p-4 text-foreground sm:p-6"
    >
      <header class="mb-5 flex items-center justify-between gap-4">
        <h2 class="text-lg font-semibold capitalize">{props.theme} theme</h2>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Specimen
        </span>
      </header>
      <div class="rounded-panel border border-outline bg-surface p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          Operational states
        </p>
        <h3 class="mt-2 text-xl font-semibold">Evidence before action</h3>
        <p class="mt-2 max-w-prose text-sm leading-6 text-muted">
          An operator should be able to distinguish a machine condition from its
          connection and the age of its readings.
        </p>
        <dl class="mt-6 divide-y divide-outline border-y border-outline">
          <For each={STATUS_SAMPLES}>
            {(status) => (
              <StatusRow
                label={status.label}
                badge={status.badge}
                tone={status.tone}
              />
            )}
          </For>
        </dl>
        <div class="mt-5 rounded-lg border border-outline bg-canvas p-4">
          <p class="text-sm font-semibold">No current reading</p>
          <p class="mt-1 text-sm leading-6 text-muted">
            An unavailable value stays unknown. The interface never turns it
            into zero or a healthy state.
          </p>
        </div>
      </div>
    </article>
  );
}
