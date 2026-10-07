import type { StatusTone } from '#shared/ui';
import type {
  RegistryNode,
  RegistrySourceReview,
} from '../../model/registry-review';

export function registryNodeName(
  id: string,
  nodes: readonly RegistryNode[],
): string {
  return nodes.find((node) => node.id === id)?.label ?? id;
}

export function registryStateTone(
  state: RegistrySourceReview['state'],
): StatusTone {
  return state === 'mapped'
    ? 'nominal'
    : state === 'not-assessed'
      ? 'unknown'
      : 'warning';
}

export function registryTargetSummary(
  review: RegistrySourceReview,
  nodes: readonly RegistryNode[],
): string {
  if (review.candidateBindings.length === 0) return 'No effective target';
  return review.candidateBindings
    .map(
      (binding) =>
        registryNodeName(binding.target.assetId, nodes) +
        ' · ' +
        binding.target.property.id +
        ' v' +
        binding.target.property.version,
    )
    .join('; ');
}
