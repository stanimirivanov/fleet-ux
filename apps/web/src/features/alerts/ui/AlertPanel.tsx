import type { JSX } from 'solid-js';

/** Domain panel carrying an unobtrusive, explicit sample-data boundary. */
export function AlertPanel(props: {
  readonly title: string;
  readonly description?: string;
  readonly action?: JSX.Element;
  readonly children: JSX.Element;
  readonly id?: string;
}) {
  return (
    <section
      id={props.id}
      aria-label={props.title}
      class="min-w-0 overflow-hidden rounded-lg border border-sample-outline border-t-2 border-t-accent/35 bg-sample-surface shadow-sm"
    >
      <div class="flex flex-wrap items-start justify-between gap-2 border-b border-outline px-4 py-3 sm:px-5">
        <div class="min-w-0">
          <h2 class="text-sm font-semibold tracking-tight">{props.title}</h2>
          {props.description && (
            <p class="mt-0.5 text-xs text-muted">{props.description}</p>
          )}
        </div>
        <div class="flex items-center gap-3">
          <span class="rounded border border-accent/20 bg-accent/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
            Sample data
          </span>
          {props.action}
        </div>
      </div>
      {props.children}
    </section>
  );
}
