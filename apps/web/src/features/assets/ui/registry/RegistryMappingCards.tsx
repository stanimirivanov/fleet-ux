import { For, Show } from 'solid-js';
import { StatusBadge } from '#shared/ui';
import type { RegistryReviewSnapshot } from '../../model/registry-review';
import {
  formatRegistryEnd,
  formatRegistryTime,
  registryStateLabel,
} from './registry-format';
import { registryNodeName, registryStateTone } from './registry-mapping-format';

/** Narrow mapping review shows the full source and each binding without sideways reading. */
export function RegistryMappingCards(props: {
  readonly snapshot: RegistryReviewSnapshot;
  readonly selectedSourceKey: string | null;
  readonly onSelectSource: (key: string) => void;
}) {
  return (
    <ul aria-label="Signal mapping cards" class="grid gap-2 p-3 lg:hidden">
      <For each={props.snapshot.sourceReviews}>
        {(review) => (
          <li>
            <article
              aria-label={`Mapping for ${review.source.signalId}`}
              class={
                'grid gap-3 rounded-md border bg-surface p-3 text-xs ' +
                (review.key === props.selectedSourceKey
                  ? 'border-accent'
                  : 'border-outline')
              }
            >
              <div class="flex flex-wrap items-start justify-between gap-2">
                <button
                  type="button"
                  aria-label={`Review source ${review.source.signalId}`}
                  aria-pressed={review.key === props.selectedSourceKey}
                  onClick={() => props.onSelectSource(review.key)}
                  class="min-w-0 break-all text-left font-semibold text-accent underline-offset-2 hover:underline focus-visible:underline"
                >
                  {review.label}
                </button>
                <StatusBadge
                  label={registryStateLabel(review.state)}
                  tone={registryStateTone(review.state)}
                />
              </div>
              <dl class="grid gap-2">
                <div>
                  <dt class="text-[11px] text-muted">Source device</dt>
                  <dd class="break-all font-mono">
                    {review.source.deviceAssetId}
                  </dd>
                </div>
                <div>
                  <dt class="text-[11px] text-muted">Endpoint</dt>
                  <dd class="break-all font-mono">
                    {review.source.endpointId}
                  </dd>
                </div>
                <div>
                  <dt class="text-[11px] text-muted">Decoded signal</dt>
                  <dd class="break-all font-mono">{review.source.signalId}</dd>
                </div>
                <div>
                  <dt class="text-[11px] text-muted">Observation</dt>
                  <dd>
                    {review.observation
                      ? 'Visible at this review time'
                      : 'Not observed at this review time'}
                    {!review.inventoried &&
                      ' · Not in declared source inventory'}
                  </dd>
                </div>
              </dl>
              <div class="border-t border-outline pt-2">
                <h4 class="font-semibold">Effective target and binding</h4>
                <Show
                  when={review.candidateBindings.length > 0}
                  fallback={
                    <p class="mt-1 text-muted">
                      No effective target or binding in this modeled scene.
                    </p>
                  }
                >
                  <ul class="mt-2 grid gap-2">
                    <For each={review.candidateBindings}>
                      {(binding) => (
                        <li class="grid gap-1 rounded-md border border-outline bg-canvas p-2">
                          <p>
                            {registryNodeName(
                              binding.target.assetId,
                              props.snapshot.nodes,
                            )}{' '}
                            · {binding.target.property.id} v
                            {binding.target.property.version}
                          </p>
                          <p class="break-all font-mono text-[11px]">
                            {binding.id} revision {binding.revision}
                          </p>
                          <p class="text-[11px] text-muted">
                            Effective{' '}
                            {formatRegistryTime(
                              binding.effectiveInterval.startMs,
                            )}{' '}
                            to{' '}
                            {formatRegistryEnd(binding.effectiveInterval.endMs)}
                          </p>
                          <p class="text-[11px] text-muted">
                            Recorded {formatRegistryTime(binding.recordedAtMs)}
                          </p>
                        </li>
                      )}
                    </For>
                  </ul>
                </Show>
              </div>
            </article>
          </li>
        )}
      </For>
    </ul>
  );
}
