import { createMemo, For, Show } from 'solid-js';
import type {
  RegistryReviewScene,
  RegistryReviewSnapshot,
} from '../../model/registry-review';

/** Physical node identity and device endpoints stay conceptually distinct. */
export function RegistryNodeDetail(props: {
  readonly scene: RegistryReviewScene;
  readonly snapshot: RegistryReviewSnapshot;
  readonly selectedNodeId: string | null;
}) {
  const selected = createMemo(() =>
    props.snapshot.nodes.find((node) => node.id === props.selectedNodeId),
  );
  const endpoints = createMemo(() =>
    props.scene.deviceEndpoints.filter(
      (endpoint) => endpoint.deviceAssetId === selected()?.id,
    ),
  );

  return (
    <Show when={selected()}>
      {(node) => (
        <div class="grid gap-2 border-t border-outline p-4 text-xs">
          <h3 class="font-semibold">{node().label}</h3>
          <p class="text-muted">
            {node().kind} · {node().typeLabel} ·{' '}
            <span class="font-mono">{node().id}</span>
          </p>
          <Show when={endpoints().length > 0}>
            <div class="grid gap-1">
              <h4 class="font-semibold">Device endpoints</h4>
              <For each={endpoints()}>
                {(endpoint) => (
                  <p class="rounded-md border border-outline bg-surface p-2 text-muted">
                    {endpoint.name} · {endpoint.kind} ·{' '}
                    <span class="font-mono">{endpoint.id}</span>
                  </p>
                )}
              </For>
              <p class="text-[11px] text-muted">
                An endpoint is a device interface, not a physical asset
                component.
              </p>
            </div>
          </Show>
        </div>
      )}
    </Show>
  );
}
