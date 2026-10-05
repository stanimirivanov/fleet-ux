import { StatusBadge } from '../shared/ui/StatusBadge';

type PreviewTheme = 'light' | 'dark';

function ThemeSample(props: { theme: PreviewTheme }) {
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
          <div class="flex min-h-14 items-center justify-between gap-4 py-3">
            <dt class="text-sm text-muted">Asset condition</dt>
            <dd>
              <StatusBadge label="Attention" tone="warning" />
            </dd>
          </div>
          <div class="flex min-h-14 items-center justify-between gap-4 py-3">
            <dt class="text-sm text-muted">Gateway connection</dt>
            <dd>
              <StatusBadge label="Connected" tone="nominal" />
            </dd>
          </div>
          <div class="flex min-h-14 items-center justify-between gap-4 py-3">
            <dt class="text-sm text-muted">Telemetry freshness</dt>
            <dd>
              <StatusBadge label="Unknown" tone="unknown" />
            </dd>
          </div>
          <div class="flex min-h-14 items-center justify-between gap-4 py-3">
            <dt class="text-sm text-muted">Alert severity</dt>
            <dd>
              <StatusBadge label="Critical" tone="critical" />
            </dd>
          </div>
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

export function DesignSystemPage() {
  return (
    <div class="max-w-7xl">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Reference · synthetic states
      </p>
      <h1 id="page-title" class="mt-2 text-3xl font-semibold tracking-tight">
        Design system
      </h1>
      <p class="mt-3 max-w-3xl text-base leading-7 text-muted">
        Light and dark use the same information hierarchy. These examples
        exercise status language and theme tokens; they are not connected fleet
        data.
      </p>
      <div class="mt-8 grid gap-5 xl:grid-cols-2">
        <ThemeSample theme="light" />
        <ThemeSample theme="dark" />
      </div>
    </div>
  );
}
