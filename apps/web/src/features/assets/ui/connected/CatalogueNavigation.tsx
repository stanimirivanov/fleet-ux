import { A } from '@solidjs/router';
import { Show } from 'solid-js';
import type { MetadataWorkspace } from './useMetadataWorkspace';

export function CatalogueNavigation(props: {
  readonly workspace: MetadataWorkspace;
  readonly selectable: boolean;
  readonly nextAfter: string | null;
}) {
  const path = () => (props.selectable ? '/assets/registry/review' : '/assets');
  return (
    <nav
      aria-label="Asset catalogue pages"
      class="flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      <p class="text-muted">
        {props.nextAfter
          ? 'Additional entries exist beyond this page.'
          : 'End of this catalogue page sequence.'}
      </p>
      <div class="flex flex-wrap gap-3">
        <Show when={props.workspace.query()?.after}>
          <A
            class="text-accent hover:underline"
            href={props.workspace.href(path(), { after: null })}
          >
            First page
          </A>
        </Show>
        <Show when={props.nextAfter}>
          {(after) => (
            <A
              class="text-accent hover:underline"
              href={props.workspace.href(path(), { after: after() })}
            >
              Next page
            </A>
          )}
        </Show>
      </div>
    </nav>
  );
}
