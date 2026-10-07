import { For, Show } from 'solid-js';
import type {
  RegistryNode,
  RegistryReviewSnapshot,
} from '../../model/registry-review';
import { formatRegistryEnd, formatRegistryTime } from './registry-format';

function nodeName(id: string, nodes: readonly RegistryNode[]): string {
  return nodes.find((node) => node.id === id)?.label ?? id;
}

/** Every effective directed edge is shown, including shared parents and cycles. */
export function RegistryRelationshipFacts(props: {
  readonly snapshot: RegistryReviewSnapshot;
}) {
  return (
    <section
      aria-label="Relationship facts"
      class="grid gap-2 border-t border-outline p-4 text-xs"
    >
      <h3 class="font-semibold">Relationship facts</h3>
      <p class="text-[11px] text-muted">
        This is the authoritative effective edge set. Shared children and cycles
        may appear in multiple facts even when the outline shows each node once.
      </p>
      <Show
        when={props.snapshot.relationships.length > 0}
        fallback={
          <p class="text-muted">
            No relationship is effective at this review time.
          </p>
        }
      >
        <ul class="grid gap-2">
          <For each={props.snapshot.relationships}>
            {(relation) => (
              <li class="rounded-md border border-outline bg-surface p-2">
                <p class="font-semibold">
                  {nodeName(relation.sourceAssetId, props.snapshot.nodes)} →{' '}
                  {nodeName(relation.targetAssetId, props.snapshot.nodes)}
                </p>
                <p class="mt-1 break-all text-[11px] text-muted">
                  {relation.relationshipType.id} v
                  {relation.relationshipType.version} · {relation.id} revision{' '}
                  {relation.revision}
                </p>
                <p class="mt-1 text-[11px] text-muted">
                  Effective{' '}
                  {formatRegistryTime(relation.effectiveInterval.startMs)} to{' '}
                  {formatRegistryEnd(relation.effectiveInterval.endMs)}
                </p>
                <p class="text-[11px] text-muted">
                  Recorded {formatRegistryTime(relation.recordedAtMs)}
                </p>
              </li>
            )}
          </For>
        </ul>
      </Show>
      <Show when={props.snapshot.missingNodeIds.length > 0}>
        <p
          role="status"
          class="rounded-md border border-status-warning/30 bg-status-warning/5 p-2 text-status-warning"
        >
          Referenced identity missing from this bounded sample graph:{' '}
          {props.snapshot.missingNodeIds.join(', ')}
        </p>
      </Show>
    </section>
  );
}
