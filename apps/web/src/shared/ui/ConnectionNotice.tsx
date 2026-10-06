import { createUniqueId, type JSX } from 'solid-js';
import { StatusBadge } from './StatusBadge';

/** Unconfigured-data notice; the surrounding page controls its placement. */
export function ConnectionNotice(props: {
  readonly heading: string;
  readonly children: JSX.Element;
}) {
  const headingId = createUniqueId();

  return (
    <section
      aria-labelledby={headingId}
      class="rounded-panel border border-outline bg-surface p-6 sm:p-8"
    >
      <StatusBadge label="Unconfigured" tone="unknown" />
      <h2 id={headingId} class="mt-5 text-xl font-semibold">
        {props.heading}
      </h2>
      <p class="mt-2 max-w-2xl text-sm leading-7 text-muted">
        {props.children}
      </p>
    </section>
  );
}
