import { A } from '@solidjs/router';
import { StatusBadge } from '../shared/ui/StatusBadge';

function ConnectionNotice(props: { heading: string; description: string }) {
  return (
    <section
      aria-labelledby="connection-heading"
      class="mt-8 max-w-3xl rounded-panel border border-outline bg-surface p-6 sm:p-8"
    >
      <StatusBadge label="Unconfigured" tone="unknown" />
      <h2 id="connection-heading" class="mt-5 text-xl font-semibold">
        {props.heading}
      </h2>
      <p class="mt-2 max-w-2xl text-sm leading-7 text-muted">
        {props.description}
      </p>
    </section>
  );
}

export function OverviewPage() {
  return (
    <div class="max-w-6xl">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Workspace
      </p>
      <h1 id="page-title" class="mt-2 text-3xl font-semibold tracking-tight">
        Fleet overview
      </h1>
      <p class="mt-3 max-w-2xl text-base leading-7 text-muted">
        This workspace will prioritize assets that need attention and show
        whether their latest evidence can be trusted.
      </p>
      <ConnectionNotice
        heading="Fleet data is not connected yet"
        description="The web application has no tenant or telemetry API
          configured. Asset counts, locations, conditions, and alerts will
          appear only after approved backend connections and data-quality rules
          are in place."
      />
      <A
        href="/design-system"
        class="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline-offset-4 hover:underline"
      >
        Review the design foundations
      </A>
    </div>
  );
}

export function AssetsPage() {
  return (
    <div class="max-w-6xl">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Workspace
      </p>
      <h1 id="page-title" class="mt-2 text-3xl font-semibold tracking-tight">
        Assets
      </h1>
      <p class="mt-3 max-w-2xl text-base leading-7 text-muted">
        The catalogue will support equipment-neutral assets and their
        relationships to components and monitoring devices.
      </p>
      <ConnectionNotice
        heading="The asset catalogue is not connected"
        description="A tenant-scoped catalogue contract is available, but this browser has
          no approved identity connection or asset data source. This is a
          connection state, not a claim that the fleet contains no assets."
      />
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div class="max-w-3xl">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Navigation
      </p>
      <h1 id="page-title" class="mt-2 text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p class="mt-3 text-base leading-7 text-muted">
        This address does not match an available FleetIQ workspace.
      </p>
      <A
        href="/"
        class="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline-offset-4 hover:underline"
      >
        Return to fleet overview
      </A>
    </div>
  );
}
