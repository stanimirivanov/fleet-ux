import { describe, expect, test } from 'vitest';
import {
  DEFAULT_ALERT_QUERY,
  filterAndSortAlerts,
  summarizeAlertQueue,
} from '../model/alert-triage';
import { DEMO_ALERTS_AS_OF, getDemoAlertTriage } from './alert-fixture';

describe('development alert triage fixture', () => {
  test('is fixed, tenant-scoped, and aligned with the sample overview links', () => {
    const preview = getDemoAlertTriage('tenant-a');
    expect(preview.source).toBe('sample');
    expect(preview.asOf).toBe('2026-10-06T10:00:00Z');
    expect(preview.asOf).toBe(DEMO_ALERTS_AS_OF);
    expect(getDemoAlertTriage('tenant-b').alerts).toEqual([]);
    expect(preview.alerts).toHaveLength(6);
    expect(new Set(preview.alerts.map((alert) => alert.id)).size).toBe(6);
    expect(
      preview.alerts
        .filter((alert) =>
          ['sample-alert-001', 'sample-alert-002', 'sample-alert-003'].includes(
            alert.id,
          ),
        )
        .map(({ id, assetId, title }) => ({ id, assetId, title }))
        .sort((left, right) => left.id.localeCompare(right.id)),
    ).toEqual([
      {
        id: 'sample-alert-001',
        assetId: 'asset-005',
        title: 'Inspection required',
      },
      {
        id: 'sample-alert-002',
        assetId: 'asset-001',
        title: 'Power variation',
      },
      {
        id: 'sample-alert-003',
        assetId: 'asset-006',
        title: 'Intermittent telemetry',
      },
    ]);
  });

  test('covers priority, historical state, and independently graded evidence', () => {
    const alerts = getDemoAlertTriage('tenant-a').alerts;
    expect(summarizeAlertQueue(alerts)).toEqual({
      total: 6,
      critical: 1,
      attention: 3,
      information: 2,
      open: 3,
    });
    expect(
      filterAndSortAlerts(alerts, DEFAULT_ALERT_QUERY).map((alert) => alert.id),
    ).toEqual([
      'sample-alert-001',
      'sample-alert-003',
      'sample-alert-002',
      'sample-alert-004',
      'sample-alert-005',
      'sample-alert-006',
    ]);
    const stale = alerts.find((alert) => alert.id === 'sample-alert-001');
    const missing = alerts.find((alert) => alert.id === 'sample-alert-005');
    const suspectCurrent = alerts.find(
      (alert) => alert.id === 'sample-alert-006',
    );
    expect(stale?.evidence[0]).toMatchObject({
      value: 104,
      freshness: 'stale',
      quality: 'suspect',
    });
    expect(missing?.evidence[0]).toMatchObject({
      value: null,
      freshness: 'missing',
      quality: 'unavailable',
    });
    expect(suspectCurrent?.evidence[0]).toMatchObject({
      value: 25.2,
      freshness: 'current',
      quality: 'suspect',
    });
  });

  test('preserves gap and time provenance without inventing readings', () => {
    const preview = getDemoAlertTriage('tenant-a');
    for (const alert of preview.alerts) {
      expect(alert.tenantId).toBe(preview.tenantId);
      expect(alert.assetId).toMatch(/^asset-00[1-8]$/);
      expect(alert.firstSeen <= alert.lastSeen).toBe(true);
      expect(alert.lastSeen <= preview.asOf).toBe(true);
      expect(alert.timeline.length).toBeGreaterThan(0);
      for (let i = 1; i < alert.timeline.length; i += 1) {
        expect(
          (alert.timeline[i - 1]?.at ?? '') >= (alert.timeline[i]?.at ?? ''),
        ).toBe(true);
      }
      for (const evidence of alert.evidence) {
        expect(evidence.series.length).toBeGreaterThan(0);
        for (let i = 1; i < evidence.series.length; i += 1) {
          expect(
            (evidence.series[i - 1]?.at ?? '') <=
              (evidence.series[i]?.at ?? ''),
          ).toBe(true);
        }
        expect(evidence.series.every((point) => point.at <= preview.asOf)).toBe(
          true,
        );
        if (evidence.freshness === 'missing') {
          expect(evidence.value).toBeNull();
          expect(evidence.eventAt).toBeNull();
          expect(evidence.receivedAt).toBeNull();
          expect(evidence.quality).toBe('unavailable');
          expect(evidence.series.some((point) => point.value === null)).toBe(
            true,
          );
        } else {
          expect(evidence.value).not.toBeNull();
          expect(evidence.eventAt).not.toBeNull();
          expect(evidence.receivedAt).not.toBeNull();
          expect((evidence.eventAt ?? '') <= (evidence.receivedAt ?? '')).toBe(
            true,
          );
          expect((evidence.receivedAt ?? '') <= preview.asOf).toBe(true);
        }
      }
    }
    const late = preview.alerts.find((alert) => alert.id === 'sample-alert-001')
      ?.evidence[0];
    expect(late?.eventAt).toBe('2026-10-06T08:32:00Z');
    expect(late?.receivedAt).toBe('2026-10-06T09:05:00Z');
  });
});
