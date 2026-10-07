/**
 * Pure tree projection for one directed asset snapshot. The graph model accepts
 * structural inputs so this module never depends on demo fixtures or transport.
 */
export interface InspectorGraphNode {
  readonly id: string;
  readonly kind: 'asset' | 'component' | 'device';
}

export interface InspectorGraphRelationship {
  readonly sourceAssetId: string;
  readonly targetAssetId: string;
}

export interface InspectorGraph<
  TNode extends InspectorGraphNode,
  TRelation extends InspectorGraphRelationship,
> {
  readonly asset: { readonly id: string };
  readonly nodes: readonly TNode[];
  readonly relationships: readonly TRelation[];
}

export interface InspectorTreeEntry<
  TNode extends InspectorGraphNode,
  TRelation extends InspectorGraphRelationship,
> {
  readonly node: TNode;
  readonly depth: number;
  /** Directed edge from the preceding level; null for the selected root. */
  readonly relation: TRelation | null;
}

/**
 * Visits reachable nodes in fixture relationship order, without revisiting a
 * node through a cycle or a second parent. Disconnected nodes are omitted.
 */
export function flattenInspectorTopology<
  TNode extends InspectorGraphNode,
  TRelation extends InspectorGraphRelationship,
>(
  graph: InspectorGraph<TNode, TRelation>,
): readonly InspectorTreeEntry<TNode, TRelation>[] {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, TRelation[]>();
  for (const relation of graph.relationships) {
    const edges = outgoing.get(relation.sourceAssetId) ?? [];
    edges.push(relation);
    outgoing.set(relation.sourceAssetId, edges);
  }

  const result: InspectorTreeEntry<TNode, TRelation>[] = [];
  const visited = new Set<string>();
  const pending: { id: string; depth: number; relation: TRelation | null }[] = [
    { id: graph.asset.id, depth: 0, relation: null },
  ];
  while (pending.length > 0) {
    const next = pending.pop();
    if (!next || visited.has(next.id)) continue;
    const node = nodesById.get(next.id);
    if (!node) continue;
    visited.add(node.id);
    result.push({ node, depth: next.depth, relation: next.relation });

    const edges = outgoing.get(node.id) ?? [];
    for (let index = edges.length - 1; index >= 0; index -= 1) {
      const relation = edges[index];
      if (relation) {
        pending.push({
          id: relation.targetAssetId,
          depth: next.depth + 1,
          relation,
        });
      }
    }
  }
  return result;
}

export interface InspectorSelectionGraph<
  TNode extends InspectorGraphNode,
  TRelation extends InspectorGraphRelationship,
> extends InspectorGraph<TNode, TRelation> {
  readonly signals: readonly {
    readonly binding: { readonly targetAssetId: string };
  }[];
}

/**
 * A shareable node selection must be reachable from the asset root. Unknown
 * selections prefer a component with bound signals, then the root.
 */
export function resolveInspectorSelection<
  TNode extends InspectorGraphNode,
  TRelation extends InspectorGraphRelationship,
>(
  graph: InspectorSelectionGraph<TNode, TRelation>,
  requestedNodeId: string | null,
): string {
  const visible = flattenInspectorTopology(graph);
  if (
    requestedNodeId !== null &&
    visible.some(({ node }) => node.id === requestedNodeId)
  ) {
    return requestedNodeId;
  }
  const boundTargets = new Set(
    graph.signals.map(({ binding }) => binding.targetAssetId),
  );
  const firstBoundComponent = visible.find(
    ({ node }) => node.kind === 'component' && boundTargets.has(node.id),
  );
  return firstBoundComponent?.node.id ?? graph.asset.id;
}
