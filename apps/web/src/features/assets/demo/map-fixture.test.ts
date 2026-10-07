import { describe, expect, test } from 'vitest';
import { PREVIEW_ASSETS } from '../api/fixture-asset-reader';
import { getDemoMapWorkbench } from './map-fixture';
import { DEMO_SNAPSHOT_AT } from './overview-fixture';

describe('sample map workbench', () => {
  test('is a complete tenant-scoped fixed sample, with no cross-tenant rows', () => {
    const workbench = getDemoMapWorkbench('tenant-a');
    expect(workbench.source).toBe('sample');
    expect(workbench.asOf).toBe(DEMO_SNAPSHOT_AT);
    expect(workbench.assets.map(({ asset }) => asset.id)).toEqual(
      PREVIEW_ASSETS.filter((asset) => asset.tenantId === 'tenant-a').map(
        (asset) => asset.id,
      ),
    );
    expect(getDemoMapWorkbench('tenant-b').assets).toEqual([]);
  });

  test('keeps position evidence distinct from telemetry freshness', () => {
    const workbench = getDemoMapWorkbench('tenant-a');
    const currentTelemetryOldPosition = workbench.assets.find(
      ({ asset }) => asset.id === 'asset-001',
    );
    const staleTelemetryRecentPosition = workbench.assets.find(
      ({ asset }) => asset.id === 'asset-005',
    );

    expect(currentTelemetryOldPosition?.operations.freshness).toBe('current');
    expect(currentTelemetryOldPosition?.location.state).toBe('last-known');
    expect(staleTelemetryRecentPosition?.operations.freshness).toBe('stale');
    expect(staleTelemetryRecentPosition?.location.state).toBe('recent');
    expect(staleTelemetryRecentPosition?.location.observedAt).not.toBe(
      staleTelemetryRecentPosition?.operations.lastObservationAt,
    );
  });

  test('has coherent evidence times and explicit unavailable positions', () => {
    const workbench = getDemoMapWorkbench('tenant-a');
    const states = new Set(
      workbench.assets.map(({ location }) => location.state),
    );
    expect(states).toEqual(new Set(['recent', 'last-known', 'unavailable']));

    for (const { asset, location } of workbench.assets) {
      expect(location.assetId).toBe(asset.id);
      if (location.state === 'unavailable') {
        expect(location.position).toBeNull();
        expect(location.observedAt).toBeNull();
        expect(location.receivedAt).toBeNull();
        expect(location.sourceLabel).toBeNull();
        expect(location.quality).toBe('unavailable');
        continue;
      }
      if (
        location.position === null ||
        location.sourceLabel === null ||
        location.observedAt === null ||
        location.receivedAt === null
      ) {
        throw new Error('Positioned sample lacks location evidence');
      }
      expect(location.observedAt <= location.receivedAt).toBe(true);
      expect(location.receivedAt <= workbench.asOf).toBe(true);
      expect(location.position.xPercent).toBeGreaterThanOrEqual(0);
      expect(location.position.xPercent).toBeLessThanOrEqual(100);
      expect(location.position.yPercent).toBeGreaterThanOrEqual(0);
      expect(location.position.yPercent).toBeLessThanOrEqual(100);
    }
  });
});
