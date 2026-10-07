import { For, Show } from 'solid-js';
import { StatusBadge } from '#shared/ui';
import type {
  RegistryNode,
  RegistrySourceReview,
} from '../../model/registry-review';
import {
  formatRegistryEnd,
  formatRegistryTime,
  registryStateLabel,
} from './registry-format';
import {
  registryStateTone,
  registryTargetSummary,
} from './registry-mapping-format';

/** A desktop source row preserves all candidates and observation status. */
export function RegistryMappingRow(props: {
  readonly review: RegistrySourceReview;
  readonly nodes: readonly RegistryNode[];
  readonly selected: boolean;
  readonly onSelect: (key: string) => void;
}) {
  return (
    <tr class="border-t border-outline align-top">
      <th scope="row" class="px-3 py-3 text-left font-normal">
        <button
          type="button"
          aria-label={`Review source ${props.review.source.signalId}`}
          aria-pressed={props.selected}
          onClick={() => props.onSelect(props.review.key)}
          class="max-w-40 break-all text-left font-semibold text-accent underline-offset-2 hover:underline focus-visible:underline"
        >
          {props.review.label}
        </button>
        <span class="mt-1 block break-all font-mono text-[11px] text-muted">
          {props.review.source.signalId}
        </span>
      </th>
      <td class="px-3 py-3 font-mono text-[11px] text-muted">
        <span class="block break-all">{props.review.source.deviceAssetId}</span>
        <span class="block break-all">{props.review.source.endpointId}</span>
        {!props.review.inventoried && (
          <span class="block font-sans">Not in declared source inventory</span>
        )}
      </td>
      <td class="px-3 py-3">
        <StatusBadge
          label={registryStateLabel(props.review.state)}
          tone={registryStateTone(props.review.state)}
        />
        <span class="mt-1 block text-[11px] text-muted">
          {props.review.observation
            ? 'Observation visible'
            : 'Not observed at this review time'}
        </span>
      </td>
      <td class="px-3 py-3 text-muted">
        {registryTargetSummary(props.review, props.nodes)}
      </td>
      <td class="px-3 py-3 font-mono text-[11px] text-muted">
        <Show
          when={props.review.candidateBindings.length > 0}
          fallback="No effective binding"
        >
          <For each={props.review.candidateBindings}>
            {(binding) => (
              <span class="block break-all">
                {binding.id} revision {binding.revision}
                <span class="block font-sans">
                  Effective{' '}
                  {formatRegistryTime(binding.effectiveInterval.startMs)} to{' '}
                  {formatRegistryEnd(binding.effectiveInterval.endMs)}
                </span>
                <span class="block font-sans">
                  Recorded {formatRegistryTime(binding.recordedAtMs)}
                </span>
              </span>
            )}
          </For>
        </Show>
      </td>
    </tr>
  );
}
