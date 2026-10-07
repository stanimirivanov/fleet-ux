import { createMemo, For } from 'solid-js';
import { flattenInspectorTopology } from '../../model/inspector-selection';
import type {
  RegistryNode,
  RegistryReviewScene,
  RegistryReviewSnapshot,
} from '../../model/registry-review';

function NodeButton(props: {
  readonly node: RegistryNode;
  readonly relationLabel: string;
  readonly depth: number;
  readonly detached: boolean;
  readonly selected: boolean;
  readonly onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      aria-label={props.node.label}
      aria-pressed={props.selected}
      onClick={() => props.onSelect(props.node.id)}
      style={{
        'padding-left': `${String(Math.min(props.depth, 4) * 14 + 10)}px`,
      }}
      class={
        'flex min-h-11 w-full items-center gap-2 rounded-md border py-2 pr-2 text-left text-xs ' +
        (props.selected
          ? 'border-sample-outline bg-accent/10 text-foreground'
          : props.detached
            ? 'border-status-warning/30 text-muted hover:bg-surface'
            : 'border-transparent text-muted hover:border-outline hover:bg-surface')
      }
    >
      <span
        aria-hidden="true"
        class="grid size-6 shrink-0 place-items-center rounded border border-outline bg-surface text-[10px] font-bold text-accent"
      >
        {props.node.kind === 'asset'
          ? 'A'
          : props.node.kind === 'device'
            ? 'D'
            : 'C'}
      </span>
      <span class="min-w-0">
        <span class="block truncate font-semibold">{props.node.label}</span>
        <span class="block truncate text-[10px]">{props.relationLabel}</span>
      </span>
    </button>
  );
}

/** One-path outline for scanning; full graph semantics remain in relationship facts. */
export function RegistryStructureOutline(props: {
  readonly scene: RegistryReviewScene;
  readonly snapshot: RegistryReviewSnapshot;
  readonly selectedNodeId: string | null;
  readonly onSelect: (id: string) => void;
}) {
  const entries = createMemo(() =>
    flattenInspectorTopology({
      asset: { id: props.scene.rootAssetId },
      nodes: props.snapshot.nodes,
      relationships: props.snapshot.relationships,
    }),
  );
  const visibleIds = createMemo(
    () => new Set(entries().map((entry) => entry.node.id)),
  );
  const detached = createMemo(() =>
    props.snapshot.nodes.filter((node) => !visibleIds().has(node.id)),
  );

  return (
    <div class="p-3">
      <ul aria-label="Registry structure outline" class="grid gap-1">
        <For each={entries()}>
          {(entry) => (
            <li>
              <NodeButton
                node={entry.node}
                relationLabel={
                  entry.relation?.relationshipType.id ?? entry.node.typeLabel
                }
                depth={entry.depth}
                detached={false}
                selected={entry.node.id === props.selectedNodeId}
                onSelect={props.onSelect}
              />
            </li>
          )}
        </For>
        <For each={detached()}>
          {(node) => (
            <li>
              <NodeButton
                node={node}
                relationLabel="No path from the root at this review time"
                depth={0}
                detached={true}
                selected={node.id === props.selectedNodeId}
                onSelect={props.onSelect}
              />
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
