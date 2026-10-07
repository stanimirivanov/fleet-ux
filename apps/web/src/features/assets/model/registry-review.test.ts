import { describe, expect, test } from 'vitest';
import {
  filterRegistryAssets,
  projectRegistrySnapshot,
  type RegistryReviewScene,
  readRegistryFilters,
  readRegistryReviewCutoffs,
  readRegistrySelection,
  registrySourceKey,
} from './registry-review';

const FIRST_SOURCE = {
  deviceAssetId: 'device-a',
  endpointId: 'can-main',
  signalId: 'temperature',
} as const;
const SECOND_SOURCE = {
  deviceAssetId: 'device-a',
  endpointId: 'can-main',
  signalId: 'pressure',
} as const;

const scene: RegistryReviewScene = {
  source: 'sample',
  tenantId: 'tenant-a',
  rootAssetId: 'asset-a',
  asOfMs: 30,
  defaultCutoffs: { effectiveAtMs: 30, knownAtMs: 30 },
  nodes: [
    { id: 'asset-a', label: 'Assembly', kind: 'asset', typeLabel: 'Assembly' },
    { id: 'device-a', label: 'Gateway', kind: 'device', typeLabel: 'Gateway' },
  ],
  relationshipRevisions: [
    {
      id: 'edge-1',
      revision: '1',
      recordedAtMs: 10,
      relationshipType: { id: 'physical.contains', version: 1 },
      sourceAssetId: 'asset-a',
      targetAssetId: 'device-a',
      effectiveInterval: { startMs: 0, endMs: null },
    },
    {
      id: 'edge-1',
      revision: '2',
      recordedAtMs: 20,
      relationshipType: { id: 'physical.contains', version: 1 },
      sourceAssetId: 'missing-asset',
      targetAssetId: 'device-a',
      effectiveInterval: { startMs: 0, endMs: null },
    },
  ],
  bindingRevisions: [
    {
      id: 'binding-1',
      revision: '1',
      recordedAtMs: 10,
      source: FIRST_SOURCE,
      target: {
        assetId: 'asset-a',
        property: { id: 'thermal.temperature', version: 1 },
      },
      effectiveInterval: { startMs: 0, endMs: null },
    },
    {
      id: 'binding-1',
      revision: '2',
      recordedAtMs: 20,
      source: SECOND_SOURCE,
      target: {
        assetId: 'missing-asset',
        property: { id: 'pressure', version: 1 },
      },
      effectiveInterval: { startMs: 0, endMs: null },
    },
    {
      id: 'binding-2',
      revision: '1',
      recordedAtMs: 20,
      source: SECOND_SOURCE,
      target: {
        assetId: 'asset-a',
        property: { id: 'pressure', version: 1 },
      },
      effectiveInterval: { startMs: 0, endMs: 30 },
    },
  ],
  sourceInventory: [
    {
      id: 'source-first',
      label: 'Temperature',
      source: FIRST_SOURCE,
      observation: { eventAtMs: 15, receivedAtMs: 16 },
    },
    {
      id: 'source-second',
      label: 'Pressure',
      source: SECOND_SOURCE,
      observation: { eventAtMs: 25, receivedAtMs: 26 },
    },
  ],
  deviceEndpoints: [
    {
      deviceAssetId: 'device-a',
      id: 'can-main',
      kind: 'bus.can',
      name: 'Main CAN',
    },
  ],
  inventoryCoverage: 'complete',
};

describe('registry review cutoffs', () => {
  test('requires the two explicit, single, safe integer URL cutoffs', () => {
    expect(readRegistryReviewCutoffs('')).toEqual({ status: 'missing' });
    expect(
      readRegistryReviewCutoffs('?effective_at_ms=30&known_at_ms=20'),
    ).toEqual({
      status: 'valid',
      cutoffs: { effectiveAtMs: 30, knownAtMs: 20 },
    });
    for (const search of [
      '?effective_at_ms=30',
      '?known_at_ms=20',
      '?effective_at_ms=30&effective_at_ms=31&known_at_ms=20',
      '?effective_at_ms=30&known_at_ms=20&known_at_ms=21',
      '?effective_at_ms=1.5&known_at_ms=20',
      '?effective_at_ms=030&known_at_ms=20',
      '?effective_at_ms=30&known_at_ms=9007199254740992',
      '?effective_at_ms=30&known_at_ms=8640000000000001',
      '?effective_at_ms=30&known_at_ms=253402300800000',
      '?effective_at_ms=30&known_at_ms=-62167219200000',
    ]) {
      expect(readRegistryReviewCutoffs(search).status).toBe('invalid');
    }
  });

  test('parses selection and filters without silently accepting duplicate IDs', () => {
    expect(readRegistrySelection('', 'asset')).toEqual({ status: 'missing' });
    expect(readRegistrySelection('?asset=asset-a', 'asset')).toEqual({
      status: 'value',
      value: 'asset-a',
    });
    expect(readRegistrySelection('?asset=', 'asset').status).toBe('invalid');
    expect(readRegistrySelection('?asset=a&asset=b', 'asset').status).toBe(
      'invalid',
    );
    expect(
      readRegistrySelection('?source=device%7Ccan%7Ctemperature', 'source'),
    ).toEqual({ status: 'value', value: 'device|can|temperature' });

    const filters = readRegistryFilters('?q=GATE%20&type=locomotive');
    expect(filters.q).toBe('GATE ');
    const rows = [
      {
        asset: { id: 'asset-a', name: 'Gateway', assetType: { id: 'device' } },
      },
      {
        asset: {
          id: 'asset-b',
          name: 'Gate locomotive',
          assetType: { id: 'locomotive' },
        },
      },
    ];
    expect(filterRegistryAssets(rows, filters)).toEqual([rows[1]]);
  });

  test('encodes the full source tuple without delimiter collisions', () => {
    expect(
      registrySourceKey({
        deviceAssetId: 'a|b',
        endpointId: 'c',
        signalId: 'd',
      }),
    ).not.toBe(
      registrySourceKey({
        deviceAssetId: 'a',
        endpointId: 'b|c',
        signalId: 'd',
      }),
    );
  });
});

describe('bitemporal registry projection', () => {
  test('selects latest known revision before filtering changed endpoints and source', () => {
    const before = projectRegistrySnapshot(scene, {
      effectiveAtMs: 25,
      knownAtMs: 19,
    });
    expect(before.relationships).toHaveLength(1);
    expect(before.relationships[0]?.sourceAssetId).toBe('asset-a');
    expect(
      before.sourceReviews.find((source) => source.id === 'source-first')
        ?.candidateBindings,
    ).toHaveLength(1);

    const after = projectRegistrySnapshot(scene, {
      effectiveAtMs: 25,
      knownAtMs: 20,
    });
    expect(after.relationships).toHaveLength(1);
    expect(after.relationships[0]?.sourceAssetId).toBe('missing-asset');
    expect(after.relationships[0]?.revision).toBe('2');
    expect(
      after.sourceReviews.find((source) => source.id === 'source-first')?.state,
    ).toBe('unassigned');
    expect(
      after.sourceReviews.find((source) => source.id === 'source-second')
        ?.state,
    ).toBe('ambiguous');
    expect(after.missingNodeIds).toEqual(['missing-asset']);
  });

  test('does not resurrect an older revision when the latest known revision is ineffective', () => {
    const corrected: RegistryReviewScene = {
      ...scene,
      relationshipRevisions: scene.relationshipRevisions.map((relation) =>
        relation.id === 'edge-1' && relation.revision === '2'
          ? { ...relation, effectiveInterval: { startMs: 0, endMs: 20 } }
          : relation,
      ),
      bindingRevisions: scene.bindingRevisions.map((binding) =>
        binding.id === 'binding-1' && binding.revision === '2'
          ? { ...binding, effectiveInterval: { startMs: 0, endMs: 20 } }
          : binding,
      ),
    };
    const snapshot = projectRegistrySnapshot(corrected, {
      effectiveAtMs: 25,
      knownAtMs: 30,
    });
    expect(snapshot.relationships).toEqual([]);
    expect(snapshot.bindings.map((binding) => binding.id)).toEqual([
      'binding-2',
    ]);
    expect(
      snapshot.sourceReviews.find((source) => source.id === 'source-first')
        ?.state,
    ).toBe('unassigned');
  });

  test('uses half-open effective intervals and keeps observation time separate', () => {
    const beforeEnd = projectRegistrySnapshot(scene, {
      effectiveAtMs: 29,
      knownAtMs: 30,
    });
    expect(beforeEnd.bindings).toHaveLength(2);
    expect(
      beforeEnd.sourceReviews.find((source) => source.id === 'source-second')
        ?.candidateBindings,
    ).toHaveLength(2);

    const atEnd = projectRegistrySnapshot(scene, {
      effectiveAtMs: 30,
      knownAtMs: 30,
    });
    expect(atEnd.bindings).toHaveLength(1);
    expect(
      atEnd.sourceReviews.find((source) => source.id === 'source-second')
        ?.candidateBindings,
    ).toHaveLength(1);
    expect(
      atEnd.sourceReviews.find((source) => source.id === 'source-first')
        ?.observation,
    ).toEqual({ eventAtMs: 15, receivedAtMs: 16 });
  });

  test('does not call absent observation or partial inventory unassigned', () => {
    const partial: RegistryReviewScene = {
      ...scene,
      inventoryCoverage: 'partial',
      sourceInventory: [
        {
          id: 'source-first',
          label: 'Temperature',
          source: FIRST_SOURCE,
          observation: null,
        },
      ],
    };
    const snapshot = projectRegistrySnapshot(partial, {
      effectiveAtMs: 30,
      knownAtMs: 30,
    });
    const temperature = snapshot.sourceReviews.find(
      (source) => source.id === 'source-first',
    );
    expect(temperature?.state).toBe('not-assessed');
    expect(temperature?.observation).toBeNull();
    expect(
      snapshot.sourceReviews.find(
        (source) => source.source.signalId === 'pressure',
      )?.state,
    ).toBe('mapped');
  });

  test('reports a missing device without discarding source records', () => {
    const withoutDevice: RegistryReviewScene = {
      ...scene,
      nodes: scene.nodes.filter((node) => node.id !== 'device-a'),
    };
    const snapshot = projectRegistrySnapshot(withoutDevice, {
      effectiveAtMs: 25,
      knownAtMs: 30,
    });
    expect(snapshot.sourceReviews[0]?.endpointState).toBe('missing-device');
    expect(snapshot.missingNodeIds).toContain('device-a');
  });

  test('reports undeclared endpoints without dropping source or graph facts', () => {
    const withoutEndpoints: RegistryReviewScene = {
      ...scene,
      deviceEndpoints: [],
    };
    const snapshot = projectRegistrySnapshot(withoutEndpoints, {
      effectiveAtMs: 25,
      knownAtMs: 30,
    });
    expect(snapshot.sourceReviews[0]?.endpointState).toBe(
      'undeclared-endpoint',
    );
    expect(snapshot.relationships[0]?.sourceAssetId).toBe('missing-asset');
  });
});
