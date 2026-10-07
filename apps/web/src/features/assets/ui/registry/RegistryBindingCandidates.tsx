import { For, Show } from 'solid-js';
import type {
  RegistryNode,
  RegistrySourceReview,
} from '../../model/registry-review';
import { formatRegistryEnd, formatRegistryTime } from './registry-format';

function nodeName(id: string, nodes: readonly RegistryNode[]): string {
  return nodes.find((node) => node.id === id)?.label ?? id;
}

/** Every effective candidate is visible; ambiguity never selects one by order. */
export function RegistryBindingCandidates(props: {
  readonly review: RegistrySourceReview;
  readonly nodes: readonly RegistryNode[];
}) {
  return (
    <section aria-label="Effective binding candidates" class="grid gap-2">
      <h4 class="font-semibold">Effective binding candidates</h4>
      <Show
        when={props.review.candidateBindings.length > 0}
        fallback={
          <p class="text-muted">
            No effective binding candidate. This does not imply an observed
            source when observation is absent.
          </p>
        }
      >
        <ul class="grid gap-2">
          <For each={props.review.candidateBindings}>
            {(binding) => (
              <li class="grid gap-1 rounded-md border border-outline bg-surface p-3">
                <p class="break-all font-mono font-semibold">
                  {binding.id} revision {binding.revision}
                </p>
                <p class="text-muted">
                  Target {nodeName(binding.target.assetId, props.nodes)} ·{' '}
                  {binding.target.property.id} v
                  {binding.target.property.version}
                </p>
                <p class="text-muted">
                  Effective{' '}
                  {formatRegistryTime(binding.effectiveInterval.startMs)} to{' '}
                  {formatRegistryEnd(binding.effectiveInterval.endMs)}
                </p>
                <p class="text-muted">
                  Recorded {formatRegistryTime(binding.recordedAtMs)}
                </p>
              </li>
            )}
          </For>
        </ul>
      </Show>
      <Show when={props.review.state === 'ambiguous'}>
        <p class="rounded-md border border-status-warning/30 bg-status-warning/5 p-2 text-status-warning">
          Multiple effective bindings exist. The registry does not choose a
          target by row order.
        </p>
      </Show>
    </section>
  );
}
