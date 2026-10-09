import { A } from '@solidjs/router';
import { Show } from 'solid-js';
import type { MetadataWorkspace } from './useMetadataWorkspace';

const pagingCopy = {
  relationship_after: {
    nav: 'Relationship pages',
    first: 'First relationship page',
    next: 'Next relationship page',
  },
  target_after: {
    nav: 'Target binding pages',
    first: 'First target binding page',
    next: 'Next target binding page',
  },
  source_after: {
    nav: 'Source binding pages',
    first: 'First source binding page',
    next: 'Next source binding page',
  },
} as const;

/** Each snapshot has an independent opaque cursor; siblings retain their pages. */
export function MetadataPagination(props: {
  readonly workspace: MetadataWorkspace;
  readonly path: string;
  readonly cursorKey: keyof typeof pagingCopy;
  readonly after?: string;
  readonly nextAfter: string | null;
}) {
  return (
    <nav
      aria-label={pagingCopy[props.cursorKey].nav}
      class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      <p class="text-muted">
        {props.nextAfter
          ? 'More records follow this page.'
          : 'End of this snapshot page sequence.'}
      </p>
      <div class="flex gap-3">
        <Show when={props.after}>
          <A
            class="text-accent hover:underline"
            href={props.workspace.href(props.path, { [props.cursorKey]: null })}
          >
            {pagingCopy[props.cursorKey].first}
          </A>
        </Show>
        <Show when={props.nextAfter}>
          {(after) => (
            <A
              class="text-accent hover:underline"
              href={props.workspace.href(props.path, {
                [props.cursorKey]: after(),
              })}
            >
              {pagingCopy[props.cursorKey].next}
            </A>
          )}
        </Show>
      </div>
    </nav>
  );
}
