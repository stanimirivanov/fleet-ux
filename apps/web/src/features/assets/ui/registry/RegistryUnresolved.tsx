import { For, Show } from 'solid-js';
import type { RegistryReviewSnapshot } from '../../model/registry-review';
import { SamplePanel } from '../overview/SamplePanel';
import { registryStateLabel } from './registry-format';

/** Visible exceptions never become an inferred all-clear when coverage is partial. */
export function RegistryUnresolved(props: {
  readonly snapshot: RegistryReviewSnapshot;
  readonly onSelectSource: (key: string) => void;
}) {
  const unresolved = () =>
    props.snapshot.sourceReviews.filter(
      (review) => review.state === 'unassigned' || review.state === 'ambiguous',
    );
  const notAssessed = () =>
    props.snapshot.sourceReviews.filter(
      (review) => review.state === 'not-assessed',
    );

  return (
    <SamplePanel
      title="Unassigned and ambiguous signals"
      description="Review of this bounded sample inventory, not a fleet-wide completeness claim"
    >
      <div class="grid gap-3 p-4 text-xs">
        <Show
          when={unresolved().length > 0}
          fallback={
            <p class="text-muted">
              No unassigned or ambiguous source appears at these review times in
              this modeled scene.
            </p>
          }
        >
          <ul class="grid gap-2">
            <For each={unresolved()}>
              {(review) => (
                <li class="rounded-md border border-status-warning/30 bg-status-warning/5 p-3">
                  <button
                    type="button"
                    onClick={() => props.onSelectSource(review.key)}
                    class="break-all text-left font-semibold text-status-warning underline-offset-2 hover:underline focus-visible:underline"
                  >
                    {review.source.signalId} ·{' '}
                    {registryStateLabel(review.state)}
                  </button>
                  <p class="mt-1 text-muted">
                    {review.state === 'ambiguous'
                      ? String(review.candidateBindings.length) +
                        ' effective binding candidates; no target is chosen automatically.'
                      : 'Observed source with no effective binding in the complete sample inventory.'}
                  </p>
                </li>
              )}
            </For>
          </ul>
        </Show>
        <Show when={notAssessed().length > 0}>
          <p class="rounded-md border border-outline bg-surface p-2 text-muted">
            {notAssessed().length} source
            {notAssessed().length === 1 ? ' is' : 's are'} not assessed at this
            cutoff. An absent observation or partial inventory cannot prove
            assignment completeness.
          </p>
        </Show>
        <p class="border-t border-outline pt-2 text-[11px] text-muted">
          Source inventory coverage for this sample scene:{' '}
          {props.snapshot.inventoryCoverage}.
        </p>
      </div>
    </SamplePanel>
  );
}
