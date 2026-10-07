import { describe, expect, test } from 'vitest';
import {
  flattenInspectorTopology,
  resolveInspectorSelection,
} from './inspector-selection';

const graph = {
  asset: { id: 'root' },
  nodes: [
    { id: 'root', kind: 'asset' },
    { id: 'system', kind: 'component' },
    { id: 'motor-a', kind: 'component' },
    { id: 'motor-b', kind: 'component' },
    { id: 'gateway', kind: 'device' },
    { id: 'orphan', kind: 'component' },
  ],
  relationships: [
    { sourceAssetId: 'root', targetAssetId: 'system' },
    { sourceAssetId: 'system', targetAssetId: 'motor-a' },
    { sourceAssetId: 'system', targetAssetId: 'motor-b' },
    { sourceAssetId: 'motor-a', targetAssetId: 'root' },
    { sourceAssetId: 'root', targetAssetId: 'gateway' },
    { sourceAssetId: 'root', targetAssetId: 'motor-a' },
  ],
  signals: [{ binding: { targetAssetId: 'motor-a' } }],
} as const;

describe('inspector topology and selection', () => {
  test('flattens reachable hierarchy once despite cycles and duplicate paths', () => {
    const flattened = flattenInspectorTopology(graph);
    expect(flattened.map(({ node, depth }) => [node.id, depth])).toEqual([
      ['root', 0],
      ['system', 1],
      ['motor-a', 2],
      ['motor-b', 2],
      ['gateway', 1],
    ]);
    expect(flattened[0]?.relation).toBeNull();
    expect(flattened[2]?.relation).toEqual({
      sourceAssetId: 'system',
      targetAssetId: 'motor-a',
    });
  });

  test('uses a reachable selection and rejects disconnected or unknown IDs', () => {
    expect(resolveInspectorSelection(graph, 'gateway')).toBe('gateway');
    expect(resolveInspectorSelection(graph, 'motor-b')).toBe('motor-b');
    expect(resolveInspectorSelection(graph, 'orphan')).toBe('motor-a');
    expect(resolveInspectorSelection(graph, 'unknown')).toBe('motor-a');
    expect(resolveInspectorSelection(graph, null)).toBe('motor-a');
  });

  test('falls back to the root when no visible component has a signal', () => {
    expect(
      resolveInspectorSelection({ ...graph, signals: [] }, 'unknown'),
    ).toBe('root');
    expect(
      resolveInspectorSelection(
        { ...graph, signals: [{ binding: { targetAssetId: 'orphan' } }] },
        null,
      ),
    ).toBe('root');
  });
});
