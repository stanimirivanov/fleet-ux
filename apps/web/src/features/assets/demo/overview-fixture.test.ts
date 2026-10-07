import { describe, expect, test } from 'vitest';
import { PREVIEW_ASSETS } from '../api/fixture-asset-reader';
import { DEMO_SNAPSHOT_AT, getDemoOverview } from './overview-fixture';

describe('sample fleet overview', () => {
  test('calculates labelled counts from the complete tenant fixture', () => {
    const overview = getDemoOverview('tenant-a');

    expect(overview.source).toBe('sample');
    expect(overview.asOf).toBe(DEMO_SNAPSHOT_AT);
    expect(overview.assets.map(({ asset }) => asset.id)).toEqual(
      PREVIEW_ASSETS.filter((asset) => asset.tenantId === 'tenant-a').map(
        (asset) => asset.id,
      ),
    );
    expect(overview.counts).toEqual({
      assetCount: 8,
      nominalCount: 4,
      attentionCount: 2,
      criticalCount: 1,
      unknownCount: 1,
      requiringAttentionCount: 3,
      connectedCount: 6,
      currentEvidenceCount: 5,
      positionedCount: 7,
    });
    expect(overview.utilization).toHaveLength(3);
    expect(
      overview.utilization.every(
        (item) =>
          item.utilizationPercent >= 0 &&
          item.utilizationPercent <= 100 &&
          item.energyIndexPercent >= 0 &&
          item.energyIndexPercent <= 100,
      ),
    ).toBe(true);
    expect(overview.trend.at(-1)).toEqual({
      day: '2026-10-06',
      reportingAssets: overview.counts.currentEvidenceCount,
      requiringAttention: overview.counts.requiringAttentionCount,
    });
  });

  test('keeps operating dimensions independent and map markers illustrative', () => {
    const overview = getDemoOverview('tenant-a');
    const gateway = overview.assets.find(
      ({ asset }) => asset.id === 'asset-003',
    );
    const locomotive = overview.assets.find(
      ({ asset }) => asset.id === 'asset-005',
    );

    expect(gateway?.operations).toMatchObject({
      condition: 'unknown',
      connectivity: 'disconnected',
      freshness: 'stale',
    });
    expect(locomotive?.operations).toMatchObject({
      condition: 'critical',
      connectivity: 'connected',
      freshness: 'stale',
    });

    for (const { operations } of overview.assets) {
      if (operations.lastObservationAt !== null) {
        expect(operations.lastObservationAt <= overview.asOf).toBe(true);
      }
      if (operations.mapPosition !== null) {
        expect(operations.mapPosition.xPercent).toBeGreaterThanOrEqual(0);
        expect(operations.mapPosition.xPercent).toBeLessThanOrEqual(100);
        expect(operations.mapPosition.yPercent).toBeGreaterThanOrEqual(0);
        expect(operations.mapPosition.yPercent).toBeLessThanOrEqual(100);
      }
    }
    expect(
      overview.alerts.every((alert) =>
        overview.assets.some(({ asset }) => asset.id === alert.assetId),
      ),
    ).toBe(true);
  });

  test('does not leak another tenant’s sample rows, alerts, or trend', () => {
    const overview = getDemoOverview('tenant-b');

    expect(overview.assets).toEqual([]);
    expect(overview.counts.assetCount).toBe(0);
    expect(overview.alerts).toEqual([]);
    expect(overview.trend).toEqual([]);
    expect(overview.utilization).toEqual([]);
  });
});
