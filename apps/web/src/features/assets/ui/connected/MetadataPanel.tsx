import { createUniqueId, type JSX, Show } from 'solid-js';

/** Presentational section; the caller owns placement in the workspace grid. */
export function MetadataPanel(props: {
  readonly title: string;
  readonly description?: string;
  readonly children: JSX.Element;
}) {
  const titleId = createUniqueId();
  return (
    <section
      aria-labelledby={titleId}
      class="min-w-0 rounded-panel border border-outline bg-surface p-4"
    >
      <h2 id={titleId} class="text-sm font-semibold">
        {props.title}
      </h2>
      <Show when={props.description}>
        <p class="mt-1 text-xs leading-5 text-muted">{props.description}</p>
      </Show>
      <div class="mt-4 min-w-0">{props.children}</div>
    </section>
  );
}
export const metadataInputClass =
  'w-full rounded-md border border-outline bg-canvas px-3 py-2 text-sm';
export const metadataButtonClass =
  'rounded-md border border-outline bg-canvas px-3 py-2 text-xs font-semibold hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent';
