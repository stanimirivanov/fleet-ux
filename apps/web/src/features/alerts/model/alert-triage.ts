/** Development-preview vocabulary; no alert mutation or server lifecycle exists. */
export type AlertSeverity = 'critical' | 'attention' | 'information';
export type AlertState = 'open' | 'acknowledged' | 'closed';
export type EvidenceFreshness = 'current' | 'stale' | 'missing';
export type EvidenceQuality = 'good' | 'suspect' | 'unavailable';

export interface AlertReferenceBand {
  readonly lower: number | null;
  readonly upper: number | null;
}
export interface AlertSource {
  readonly gatewayId: string;
  readonly endpointId: string;
  readonly signalId: string;
}
/** A null point is a gap, never a zero reading. */
export interface AlertSeriesPoint {
  readonly at: string;
  readonly value: number | null;
}
/** Freshness, quality, and severity describe independent concerns. */
export interface AlertSignalEvidence {
  readonly id: string;
  readonly label: string;
  readonly value: number | null;
  readonly unit: string;
  readonly referenceBand: AlertReferenceBand | null;
  readonly eventAt: string | null;
  readonly receivedAt: string | null;
  readonly quality: EvidenceQuality;
  readonly freshness: EvidenceFreshness;
  readonly source: AlertSource | null;
  readonly series: readonly AlertSeriesPoint[];
  readonly note: string;
}
export type AlertTimelineKind =
  | 'observation'
  | 'triggered'
  | 'acknowledged'
  | 'cleared'
  | 'gap';
export interface AlertTimelineEntry {
  readonly id: string;
  readonly at: string;
  readonly kind: AlertTimelineKind;
  readonly title: string;
  readonly detail: string;
}
/** A fixed sample incident, not a backend alert or live asset condition. */
export interface AlertRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly assetId: string;
  readonly assetLabel: string;
  readonly assetType: string;
  readonly componentLabel: string;
  readonly title: string;
  readonly summary: string;
  readonly severity: AlertSeverity;
  readonly state: AlertState;
  readonly firstSeen: string;
  readonly lastSeen: string;
  readonly triggerCondition: string;
  readonly evidence: readonly AlertSignalEvidence[];
  readonly timeline: readonly AlertTimelineEntry[];
}
export interface AlertQuery {
  readonly severity: 'all' | AlertSeverity;
  readonly state: 'all' | AlertState;
  readonly search: string;
}
export const DEFAULT_ALERT_QUERY: AlertQuery = {
  severity: 'all',
  state: 'all',
  search: '',
};
/** Duplicated alert keys are an explicit unavailable selection, never first-wins. */
export function requestedAlertId(params: URLSearchParams): string | null {
  const values = params.getAll('alert');
  if (values.length === 0) return null;
  return values.length === 1 ? (values[0] ?? '') : '';
}
/** Invalid URL filters fall back to all; search stays short and printable. */
export function parseAlertQuery(params: URLSearchParams): AlertQuery {
  const severity = params.getAll('severity');
  const state = params.getAll('state');
  const search = params.getAll('q');
  return {
    severity:
      severity.length === 1 &&
      (severity[0] === 'critical' ||
        severity[0] === 'attention' ||
        severity[0] === 'information')
        ? severity[0]
        : 'all',
    state:
      state.length === 1 &&
      (state[0] === 'open' ||
        state[0] === 'acknowledged' ||
        state[0] === 'closed')
        ? state[0]
        : 'all',
    search:
      search.length === 1
        ? (search[0] ?? '').replace(/\p{Cc}/gu, ' ').slice(0, 120)
        : '',
  };
}
/** Rewrites only queue filters; preview mode and alert selection survive. */
export function toAlertSearchParams(
  query: AlertQuery,
  existing: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  const params = new URLSearchParams(existing);
  params.delete('severity');
  params.delete('state');
  params.delete('q');
  if (query.severity !== 'all') params.set('severity', query.severity);
  if (query.state !== 'all') params.set('state', query.state);
  const search = query.search.replace(/\p{Cc}/gu, ' ').slice(0, 120);
  if (search) params.set('q', search);
  return params;
}
const SEVERITY_RANK: Readonly<Record<AlertSeverity, number>> = {
  critical: 0,
  attention: 1,
  information: 2,
};
const STATE_RANK: Readonly<Record<AlertState, number>> = {
  open: 0,
  acknowledged: 1,
  closed: 2,
};
/** Group by priority then state, newest update first, with stable ID ties. */
export function filterAndSortAlerts(
  alerts: readonly AlertRecord[],
  query: AlertQuery,
): readonly AlertRecord[] {
  const term = query.search.trim().toLocaleLowerCase();
  return alerts
    .filter((alert) => {
      if (query.severity !== 'all' && alert.severity !== query.severity)
        return false;
      if (query.state !== 'all' && alert.state !== query.state) return false;
      if (!term) return true;
      return [
        alert.id,
        alert.assetLabel,
        alert.assetType,
        alert.componentLabel,
        alert.title,
        alert.summary,
      ].some((value) => value.toLocaleLowerCase().includes(term));
    })
    .sort(
      (left, right) =>
        SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity] ||
        STATE_RANK[left.state] - STATE_RANK[right.state] ||
        right.lastSeen.localeCompare(left.lastSeen) ||
        left.id.localeCompare(right.id),
    );
}
export interface AlertSelection {
  readonly alert: AlertRecord | null;
  /** Explicit unknown or filtered selection remains in the URL. */
  readonly unavailable: 'not-in-view' | null;
}
/** Absence selects the first visible row; an explicit unknown ID never does. */
export function selectAlert(
  visibleAlerts: readonly AlertRecord[],
  requestedId: string | null,
): AlertSelection {
  if (requestedId === null) {
    return { alert: visibleAlerts[0] ?? null, unavailable: null };
  }
  const alert = visibleAlerts.find((candidate) => candidate.id === requestedId);
  return alert
    ? { alert, unavailable: null }
    : { alert: null, unavailable: 'not-in-view' };
}
export interface AlertQueueSummary {
  readonly total: number;
  readonly critical: number;
  readonly attention: number;
  readonly information: number;
  readonly open: number;
}
/** Counts use the complete fixture, not the currently filtered queue. */
export function summarizeAlertQueue(
  alerts: readonly AlertRecord[],
): AlertQueueSummary {
  return {
    total: alerts.length,
    critical: alerts.filter((alert) => alert.severity === 'critical').length,
    attention: alerts.filter((alert) => alert.severity === 'attention').length,
    information: alerts.filter((alert) => alert.severity === 'information')
      .length,
    open: alerts.filter((alert) => alert.state === 'open').length,
  };
}
