import { createMemo, createSignal, For, Show } from 'solid-js';
import type { DemoInspector } from '../../demo/inspector-fixture';
import { flattenInspectorTopology } from '../../model/inspector-selection';
import { SamplePanel } from '../overview/SamplePanel';

/** A searchable projection of directed physical relationships at the sample cutoff. */
export function TopologyTree(props: {
  readonly inspector: DemoInspector;
  readonly selectedId: string;
  readonly onSelect: (nodeId: string) => void;
}) {
  const [query, setQuery] = createSignal('');
  const entries = createMemo(() => flattenInspectorTopology(props.inspector));
  const visible = createMemo(() =>
    entries().filter(({ node }) =>
      node.label
        .toLocaleLowerCase()
        .includes(query().trim().toLocaleLowerCase()),
    ),
  );

  return (
    <SamplePanel
      title="Asset topology"
      description="Directed relationships at this snapshot"
    >
      <div class="px-4 py-3">
        <label class="block text-[11px] font-medium text-muted">
          Find a component
          <input
            type="search"
            value={query()}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder="Name or system"
            class="mt-1 block h-9 w-full rounded-md border border-outline bg-surface px-3 text-xs text-foreground placeholder:text-muted"
          />
        </label>
      </div>
      <div class="max-h-[32rem] overflow-y-auto border-t border-outline p-2">
        <Show
          when={visible().length > 0}
          fallback={
            <p role="status" class="p-3 text-xs text-muted">
              No components match this search.
            </p>
          }
        >
          <ul class="grid gap-1" aria-label="Asset topology nodes">
            <For each={visible()}>
              {(entry) => (
                <li>
                  <button
                    type="button"
                    aria-label={entry.node.label}
                    aria-pressed={entry.node.id === props.selectedId}
                    onClick={() => props.onSelect(entry.node.id)}
                    class={
                      'flex min-h-11 w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors ' +
                      (entry.node.id === props.selectedId
                        ? 'border-sample-outline bg-accent/10 text-foreground'
                        : 'border-transparent text-muted hover:border-outline hover:bg-surface hover:text-foreground')
                    }
                    style={{
                      'padding-left': `${Math.min(entry.depth, 4) * 14 + 8}px`,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      class="grid size-6 shrink-0 place-items-center rounded border border-outline bg-surface text-[10px] font-bold text-accent"
                    >
                      {entry.node.kind === 'asset'
                        ? 'A'
                        : entry.node.kind === 'device'
                          ? 'D'
                          : 'C'}
                    </span>
                    <span class="min-w-0">
                      <span class="block truncate font-semibold">
                        {entry.node.label}
                      </span>
                      <span class="block truncate text-[10px] text-muted">
                        {entry.relation?.typeLabel ?? entry.node.typeLabel}
                      </span>
                    </span>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
      <p class="border-t border-outline px-4 py-2 text-[11px] text-muted">
        Components and communication devices keep separate identities.
      </p>
    </SamplePanel>
  );
}
