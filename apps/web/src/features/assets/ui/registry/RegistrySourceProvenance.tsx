import { Show } from 'solid-js';
import type {
  RegistryNode,
  RegistryReviewSnapshot,
  RegistrySourceReview,
} from '../../model/registry-review';
import { SamplePanel } from '../overview/SamplePanel';
import { RegistryBindingCandidates } from './RegistryBindingCandidates';
import { formatRegistryTime, registryStateLabel } from './registry-format';

function nodeName(id: string, nodes: readonly RegistryNode[]): string {
  return nodes.find((node) => node.id === id)?.label ?? id;
}

function observationTime(
  review: RegistrySourceReview,
  field: 'eventAtMs' | 'receivedAtMs',
  fallback: string,
): string {
  return review.observation
    ? formatRegistryTime(review.observation[field])
    : fallback;
}

function Detail(props: { readonly label: string; readonly value: string }) {
  return (
    <div class="grid gap-0.5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-2">
      <dt class="text-muted">{props.label}</dt>
      <dd class="min-w-0 break-all font-medium">{props.value}</dd>
    </div>
  );
}

/** Exact source identity and observation provenance stay separate from bindings. */
export function RegistrySourceProvenance(props: {
  readonly snapshot: RegistryReviewSnapshot;
  readonly selected: RegistrySourceReview | null;
  readonly requestedSourceKey: string | null;
}) {
  return (
    <SamplePanel
      title="Source provenance"
      description="Device, endpoint, decoded signal, observation, and binding revisions"
    >
      <Show
        when={props.selected}
        fallback={
          <p role="status" class="p-5 text-xs text-muted">
            {props.requestedSourceKey
              ? 'The requested source is not present in this selected review.'
              : 'Select a source in the mapping table to inspect its provenance.'}
          </p>
        }
      >
        {(review) => (
          <div class="grid gap-3 p-4 text-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="font-semibold">{review().label}</h3>
              <span class="rounded border border-outline bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {registryStateLabel(review().state)}
              </span>
            </div>
            <dl class="grid gap-2 rounded-md border border-outline bg-surface p-3">
              <Detail
                label="Source device"
                value={
                  nodeName(
                    review().source.deviceAssetId,
                    props.snapshot.nodes,
                  ) +
                  ' · ' +
                  review().source.deviceAssetId
                }
              />
              <Detail label="Endpoint" value={review().source.endpointId} />
              <Detail label="Decoded signal" value={review().source.signalId} />
              <Detail
                label="Endpoint registration"
                value={registryStateLabel(review().endpointState)}
              />
              <Detail
                label="Declared inventory"
                value={review().inventoried ? 'Included' : 'Not included'}
              />
              <Detail
                label="Observed event"
                value={observationTime(
                  review(),
                  'eventAtMs',
                  'Not observed at this review time',
                )}
              />
              <Detail
                label="Received by FleetIQ"
                value={observationTime(
                  review(),
                  'receivedAtMs',
                  'No received observation at this review time',
                )}
              />
            </dl>
            <RegistryBindingCandidates
              review={review()}
              nodes={props.snapshot.nodes}
            />
          </div>
        )}
      </Show>
    </SamplePanel>
  );
}
