import { useAtomValue } from '@effect/atom-solid';
import * as Atom from 'effect/reactivity/Atom';
import { StatusBadge } from '../shared/ui/StatusBadge';

// The scaffold has no transport yet. Keep this explicit until the API contract
// and mock/live adapters arrive in their own reviewable changes.
const connectionState = Atom.make('unconfigured' as const);

type PreviewTheme = 'light' | 'dark';

function ThemeSample(props: { theme: PreviewTheme }) {
  return (
    <article
      data-theme={props.theme}
      class="rounded-panel border border-outline bg-canvas p-4 text-foreground sm:p-6"
    >
      <header class="mb-5 flex items-center justify-between gap-4">
        <h3 class="text-lg font-semibold capitalize">{props.theme} theme</h3>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Specimen
        </span>
      </header>

      <div class="rounded-panel border border-outline bg-surface p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          Operational states
        </p>
        <h4 class="mt-2 text-xl font-semibold">Evidence before action</h4>
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

export function App() {
  const status = useAtomValue(() => connectionState);

  return (
    <main class="min-h-screen bg-canvas px-5 py-8 text-foreground sm:px-8 lg:px-12">
      <div class="mx-auto max-w-7xl">
        <header class="flex flex-wrap items-center justify-between gap-4 border-b border-outline pb-6">
          <div class="flex items-center gap-3">
            <span
              aria-hidden="true"
              class="grid size-10 place-items-center rounded-xl bg-accent text-sm font-bold text-on-accent"
            >
              FI
            </span>
            <span class="text-xl font-bold tracking-tight">FleetIQ</span>
          </div>
          <span class="rounded-full border border-outline bg-surface px-3 py-1.5 text-xs font-semibold text-muted">
            Design foundations · M02
          </span>
        </header>

        <section class="max-w-3xl py-10 sm:py-14">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-accent">
            Operator console design language
          </p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Clarity for every asset state.
          </h1>
          <p class="mt-4 text-base leading-7 text-muted">
            These light and dark specimens define the visual foundation for
            FleetIQ. Product navigation, asset data, and live workflows arrive
            as separate reviewable slices.
          </p>
          <p
            role="status"
            class="mt-6 inline-block rounded-lg border border-outline bg-surface px-4 py-2 text-sm text-muted"
          >
            Backend connection: {status()}
          </p>
        </section>

        <section aria-labelledby="theme-specimens">
          <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="theme-specimens" class="text-xl font-semibold">
                Theme specimens
              </h2>
              <p class="mt-1 text-sm text-muted">
                Light is the default. Both themes use the same information
                hierarchy and status language.
              </p>
            </div>
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Synthetic states · no fleet data
            </p>
          </div>
          <div class="grid gap-5 xl:grid-cols-2">
            <ThemeSample theme="light" />
            <ThemeSample theme="dark" />
          </div>
        </section>
      </div>
    </main>
  );
}
