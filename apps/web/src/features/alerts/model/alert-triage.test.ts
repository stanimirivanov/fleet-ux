import { describe, expect, test } from 'vitest';
import type { AlertRecord } from './alert-triage';
import {
  DEFAULT_ALERT_QUERY,
  filterAndSortAlerts,
  parseAlertQuery,
  requestedAlertId,
  selectAlert,
  summarizeAlertQueue,
  toAlertSearchParams,
} from './alert-triage';

const records: readonly AlertRecord[] = [
  {
    id: 'later-attention',
    tenantId: 'tenant-a',
    assetId: 'asset-a',
    assetLabel: 'Motor A',
    assetType: 'Machine',
    componentLabel: 'Motor',
    title: 'Power variation',
    summary: 'Review motor power',
    severity: 'attention',
    state: 'acknowledged',
    firstSeen: '2026-10-06T09:00:00Z',
    lastSeen: '2026-10-06T09:50:00Z',
    triggerCondition: 'Example condition',
    evidence: [],
    timeline: [],
  },
  {
    id: 'critical',
    tenantId: 'tenant-a',
    assetId: 'asset-b',
    assetLabel: 'Rail unit',
    assetType: 'Locomotive',
    componentLabel: 'Motor',
    title: 'Temperature',
    summary: 'Review temperature',
    severity: 'critical',
    state: 'open',
    firstSeen: '2026-10-06T09:10:00Z',
    lastSeen: '2026-10-06T09:10:00Z',
    triggerCondition: 'Example condition',
    evidence: [],
    timeline: [],
  },
  {
    id: 'early-attention',
    tenantId: 'tenant-a',
    assetId: 'asset-c',
    assetLabel: 'Truck',
    assetType: 'Service truck',
    componentLabel: 'Power unit',
    title: 'Power variation',
    summary: 'Review power',
    severity: 'attention',
    state: 'open',
    firstSeen: '2026-10-06T09:00:00Z',
    lastSeen: '2026-10-06T09:20:00Z',
    triggerCondition: 'Example condition',
    evidence: [],
    timeline: [],
  },
];

describe('alert queue model', () => {
  test('parses URL filters and keeps spaces while a controlled search is typed', () => {
    const query = parseAlertQuery(
      new URLSearchParams('severity=attention&state=open&q=%20Motor%20'),
    );
    expect(query).toEqual({
      severity: 'attention',
      state: 'open',
      search: ' Motor ',
    });
    const params = toAlertSearchParams(
      query,
      new URLSearchParams('preview=sample&alert=critical&state=closed'),
    );
    expect(params.get('preview')).toBe('sample');
    expect(params.get('alert')).toBe('critical');
    expect(params.getAll('state')).toEqual(['open']);
    expect(params.get('q')).toBe(' Motor ');
    expect(parseAlertQuery(params)).toEqual(query);
  });

  test('ignores malformed and duplicate filters without changing selection', () => {
    expect(
      parseAlertQuery(
        new URLSearchParams(
          'severity=critical&severity=attention&state=x&q=a&q=b',
        ),
      ),
    ).toEqual(DEFAULT_ALERT_QUERY);
    expect(
      parseAlertQuery(new URLSearchParams('q=%00'.concat('x'.repeat(140))))
        .search,
    ).toHaveLength(120);
    expect(requestedAlertId(new URLSearchParams())).toBeNull();
    expect(requestedAlertId(new URLSearchParams('alert=critical'))).toBe(
      'critical',
    );
    expect(
      requestedAlertId(new URLSearchParams('alert=critical&alert=other')),
    ).toBe('');
    expect(requestedAlertId(new URLSearchParams('alert='))).toBe('');
    expect(selectAlert(records, '../other-tenant')).toEqual({
      alert: null,
      unavailable: 'not-in-view',
    });
    expect(selectAlert(records, '')).toEqual({
      alert: null,
      unavailable: 'not-in-view',
    });
  });

  test('filters case-insensitively and sorts priority then state then time', () => {
    const sorted = filterAndSortAlerts(records, DEFAULT_ALERT_QUERY);
    expect(sorted.map((alert) => alert.id)).toEqual([
      'critical',
      'early-attention',
      'later-attention',
    ]);
    expect(records.map((alert) => alert.id)).toEqual([
      'later-attention',
      'critical',
      'early-attention',
    ]);
    expect(
      filterAndSortAlerts(records, {
        severity: 'attention',
        state: 'all',
        search: ' POWER ',
      }).map((alert) => alert.id),
    ).toEqual(['early-attention', 'later-attention']);
    expect(
      filterAndSortAlerts(records, {
        severity: 'all',
        state: 'acknowledged',
        search: 'truck',
      }),
    ).toEqual([]);
  });

  test('does not silently replace an explicit selection hidden by filters', () => {
    const visible = filterAndSortAlerts(records, {
      severity: 'attention',
      state: 'open',
      search: '',
    });
    expect(selectAlert(visible, null).alert?.id).toBe('early-attention');
    expect(selectAlert(visible, 'critical')).toEqual({
      alert: null,
      unavailable: 'not-in-view',
    });
    expect(selectAlert([], null)).toEqual({
      alert: null,
      unavailable: null,
    });
  });

  test('summarizes the supplied complete set independently of active filters', () => {
    expect(summarizeAlertQueue(records)).toEqual({
      total: 3,
      critical: 1,
      attention: 2,
      information: 0,
      open: 2,
    });
  });
});
