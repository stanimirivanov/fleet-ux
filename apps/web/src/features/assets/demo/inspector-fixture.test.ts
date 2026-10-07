import { describe, expect, test } from 'vitest';
import { getDemoInspector } from './inspector-fixture';
import { DEMO_SNAPSHOT_AT } from './overview-fixture';

describe('sample asset inspector evidence', () => {
  test('keeps tenant ownership and unsupported detail explicit', () => {
    expect(getDemoInspector('tenant-a', 'asset-001')).toBeNull();
    expect(getDemoInspector('tenant-b', 'asset-004')).toBeNull();
    expect(getDemoInspector('tenant-a', 'absent')).toBeNull();

    const rail = getDemoInspector('tenant-a', 'asset-004');
    const trailer = getDemoInspector('tenant-a', 'asset-008');
    expect(rail?.asset.id).toBe('asset-004');
    expect(trailer?.asset.id).toBe('asset-008');
    expect(rail?.source).toBe('sample');
    expect(trailer?.source).toBe('sample');
    expect(rail?.asOf).toBe(DEMO_SNAPSHOT_AT);
    expect(trailer?.asOf).toBe(DEMO_SNAPSHOT_AT);
  });

  test('keeps topology and attribution references within the rail snapshot', () => {
    const inspector = getDemoInspector('tenant-a', 'asset-004');
    expect(inspector).not.toBeNull();
    if (!inspector) return;

    const nodes = new Map(inspector.nodes.map((node) => [node.id, node]));
    expect(inspector.nodes[0]?.id).toBe(inspector.asset.id);
    for (const relation of inspector.relationships) {
      expect(nodes.has(relation.sourceAssetId)).toBe(true);
      expect(nodes.has(relation.targetAssetId)).toBe(true);
      expect(relation.effectiveFrom <= inspector.asOf).toBe(true);
      expect(relation.recordedAt <= inspector.asOf).toBe(true);
      expect(relation.revision).toMatch(/^[1-9][0-9]*$/);
    }
    expect(
      inspector.relationships
        .filter((relation) => relation.sourceAssetId === 'asset-004')
        .map((relation) => relation.targetAssetId),
    ).toEqual([
      'sample-traction-417',
      'sample-energy-417',
      'sample-gateway-417',
    ]);
    expect(
      inspector.relationships
        .filter((relation) => relation.sourceAssetId === 'sample-traction-417')
        .map((relation) => relation.targetAssetId),
    ).toEqual(['sample-motor-417', 'sample-motor-b-417']);
    expect(
      inspector.signals.map(({ binding }) => binding.targetAssetId),
    ).toEqual(['sample-motor-417', 'sample-motor-417', 'sample-bms-417']);
    expect(
      inspector.signals.filter(
        (signal) => signal.binding.targetAssetId === 'sample-motor-b-417',
      ),
    ).toEqual([]);
    for (const signal of inspector.signals) {
      expect(nodes.get(signal.source.deviceAssetId)?.kind).toBe('device');
      expect(nodes.get(signal.binding.targetAssetId)?.kind).toBe('component');
      expect(signal.binding.revision).toMatch(/^[1-9][0-9]*$/);
      expect(signal.binding.effectiveFrom <= inspector.asOf).toBe(true);
      expect(signal.binding.recordedAt <= inspector.asOf).toBe(true);
      expect(signal.source.protocolPackageId).toBe('sample.can-gateway');
      expect(signal.eventAt).not.toBeNull();
      expect(signal.receivedAt).not.toBeNull();
      expect(
        signal.eventAt &&
          signal.receivedAt &&
          signal.eventAt <= signal.receivedAt,
      ).toBe(true);
      expect(signal.receivedAt && signal.receivedAt <= inspector.asOf).toBe(
        true,
      );
      expect(signal.series.at(-1)?.value?.toString()).toBe(signal.value);
      expect(signal.series.every((point) => point.at <= inspector.asOf)).toBe(
        true,
      );
      expect(
        signal.series.every(
          (point, index) =>
            index === 0 ||
            (signal.series[index - 1]?.at ?? point.at) < point.at,
        ),
      ).toBe(true);
    }
  });

  test('retains a visible rail gap and an unattributed source without inventing a value', () => {
    const inspector = getDemoInspector('tenant-a', 'asset-004');
    expect(inspector).not.toBeNull();
    if (!inspector) return;

    const gap = inspector.gaps[0];
    expect(gap).toBeDefined();
    if (!gap) return;
    const motor = inspector.signals.find(
      (signal) => signal.id === gap?.signalId,
    );
    expect(gap?.targetAssetId).toBe('sample-motor-417');
    expect(
      motor?.series.some(
        (point) =>
          point.value === null &&
          point.at >= gap.startAt &&
          point.at < gap.endAt,
      ),
    ).toBe(true);
    expect(
      inspector.events.some(
        (event) =>
          event.kind === 'gap' && event.targetAssetId === gap.targetAssetId,
      ),
    ).toBe(true);
    expect(
      inspector.signals
        .filter((signal) => signal.binding.targetAssetId === 'sample-motor-417')
        .map((signal) => signal.label),
    ).toEqual(['Motor temperature', 'Traction power']);
    expect(inspector.unattributed).toHaveLength(1);
    expect(inspector.unattributed[0]?.source.deviceAssetId).toBe(
      'sample-gateway-417',
    );
    expect(
      inspector.events.some((event) => event.kind === 'unattributed'),
    ).toBe(true);
    expect(
      inspector.signals.some(
        (signal) =>
          signal.source.signalId === inspector.unattributed[0]?.source.signalId,
      ),
    ).toBe(false);
  });

  test('represents configured trailer monitoring without a reported reading', () => {
    const inspector = getDemoInspector('tenant-a', 'asset-008');
    expect(inspector).not.toBeNull();
    if (!inspector) return;

    expect(inspector.operations.connectivity).toBe('unknown');
    expect(inspector.operations.freshness).toBe('unknown');
    expect(inspector.operations.lastObservationAt).toBeNull();
    expect(inspector.signals).toHaveLength(1);
    expect(inspector.signals[0]).toMatchObject({
      value: null,
      quality: 'not-observed',
      eventAt: null,
      receivedAt: null,
      source: {
        deviceAssetId: 'sample-tracker-011',
        protocolPackageId: 'sample.refrigeration-tracker',
      },
      binding: { targetAssetId: 'sample-freezer-011' },
      series: [],
    });
    expect(inspector.events).toEqual([]);
    expect(inspector.gaps).toHaveLength(1);
    expect(inspector.unattributed).toEqual([]);
  });
});
