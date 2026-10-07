import { PREVIEW_ASSETS } from '../api/fixture-asset-reader';
import type { AssetSummary } from '../model/asset-catalogue';

/**
 * All operational values in this module are invented for visual review. They
 * describe one fixed sample snapshot, not the current state of any asset.
 */
export const DEMO_SNAPSHOT_AT = '2026-10-06T10:00:00Z';

export type DemoCondition = 'nominal' | 'attention' | 'critical' | 'unknown';
export type DemoConnectivity = 'connected' | 'disconnected' | 'unknown';
export type DemoFreshness = 'current' | 'stale' | 'unknown';

/** Percentage coordinates on an illustrative canvas, never real geography. */
export interface DemoMapPosition {
  readonly xPercent: number;
  readonly yPercent: number;
}

/** Synthetic operating context kept separate from the backend asset summary. */
export interface DemoAssetOperations {
  readonly siteLabel: string;
  readonly condition: DemoCondition;
  readonly connectivity: DemoConnectivity;
  /** Relative to DEMO_SNAPSHOT_AT, not to the viewer's current clock. */
  readonly freshness: DemoFreshness;
  readonly lastObservationAt: string | null;
  readonly mapPosition: DemoMapPosition | null;
}

/**
 * Visual-only projections keyed by the asset IDs in the catalogue fixture.
 * No device state, location, or health value is inferred from AssetSummary.
 */
export const DEMO_ASSET_OPERATIONS: Readonly<
  Record<string, DemoAssetOperations>
> = {
  'asset-001': {
    siteLabel: 'North yard',
    condition: 'attention',
    connectivity: 'connected',
    freshness: 'current',
    lastObservationAt: '2026-10-06T09:54:00Z',
    mapPosition: { xPercent: 14, yPercent: 40 },
  },
  'asset-002': {
    siteLabel: 'North yard',
    condition: 'nominal',
    connectivity: 'connected',
    freshness: 'current',
    lastObservationAt: '2026-10-06T09:52:00Z',
    mapPosition: { xPercent: 27, yPercent: 49 },
  },
  'asset-003': {
    siteLabel: 'North yard',
    condition: 'unknown',
    connectivity: 'disconnected',
    freshness: 'stale',
    lastObservationAt: '2026-10-06T08:10:00Z',
    mapPosition: { xPercent: 37, yPercent: 38 },
  },
  'asset-004': {
    siteLabel: 'Central depot',
    condition: 'nominal',
    connectivity: 'connected',
    freshness: 'current',
    lastObservationAt: '2026-10-06T09:58:00Z',
    mapPosition: { xPercent: 45, yPercent: 25 },
  },
  'asset-005': {
    siteLabel: 'East branch',
    condition: 'critical',
    connectivity: 'connected',
    freshness: 'stale',
    lastObservationAt: '2026-10-06T08:32:00Z',
    mapPosition: { xPercent: 68, yPercent: 37 },
  },
  'asset-006': {
    siteLabel: 'East branch',
    condition: 'attention',
    connectivity: 'connected',
    freshness: 'current',
    lastObservationAt: '2026-10-06T09:49:00Z',
    mapPosition: { xPercent: 74, yPercent: 62 },
  },
  'asset-007': {
    siteLabel: 'South service hub',
    condition: 'nominal',
    connectivity: 'connected',
    freshness: 'current',
    lastObservationAt: '2026-10-06T09:55:00Z',
    mapPosition: { xPercent: 52, yPercent: 72 },
  },
  'asset-008': {
    siteLabel: 'Unassigned',
    condition: 'nominal',
    connectivity: 'unknown',
    freshness: 'unknown',
    lastObservationAt: null,
    mapPosition: null,
  },
};

export interface DemoAlert {
  readonly id: string;
  readonly assetId: string;
  readonly severity: 'attention' | 'critical';
  readonly title: string;
  readonly summary: string;
  readonly openedAt: string;
}

/** Illustrative queue entries; no alert lifecycle API is implied. */
export const DEMO_ALERTS: readonly DemoAlert[] = [
  {
    id: 'sample-alert-001',
    assetId: 'asset-005',
    severity: 'critical',
    title: 'Inspection required',
    summary: 'Sample diagnostic evidence crossed its illustrative band.',
    openedAt: '2026-10-06T09:06:00Z',
  },
  {
    id: 'sample-alert-002',
    assetId: 'asset-001',
    severity: 'attention',
    title: 'Power variation',
    summary: 'Sample power readings varied beyond the example range.',
    openedAt: '2026-10-06T09:31:00Z',
  },
  {
    id: 'sample-alert-003',
    assetId: 'asset-006',
    severity: 'attention',
    title: 'Intermittent telemetry',
    summary: 'Sample observations have gaps in the example timeline.',
    openedAt: '2026-10-06T09:40:00Z',
  },
];

export interface DemoTrendPoint {
  readonly day: string;
  readonly reportingAssets: number;
  readonly requiringAttention: number;
}

/** Fixed illustrative seven-day trend, ending at DEMO_SNAPSHOT_AT. */
export const DEMO_TREND: readonly DemoTrendPoint[] = [
  { day: '2026-09-30', reportingAssets: 4, requiringAttention: 2 },
  { day: '2026-10-01', reportingAssets: 5, requiringAttention: 2 },
  { day: '2026-10-02', reportingAssets: 5, requiringAttention: 1 },
  { day: '2026-10-03', reportingAssets: 6, requiringAttention: 2 },
  { day: '2026-10-04', reportingAssets: 5, requiringAttention: 2 },
  { day: '2026-10-05', reportingAssets: 6, requiringAttention: 3 },
  { day: '2026-10-06', reportingAssets: 5, requiringAttention: 3 },
];

export interface DemoUtilizationDatum {
  readonly category: string;
  readonly utilizationPercent: number;
  /** Illustrative normalized index; not a physical energy unit. */
  readonly energyIndexPercent: number;
}

/** Visual-only utilization and energy comparison, not calculated from assets. */
export const DEMO_UTILIZATION: readonly DemoUtilizationDatum[] = [
  { category: 'Rail traction', utilizationPercent: 74, energyIndexPercent: 62 },
  { category: 'Road service', utilizationPercent: 58, energyIndexPercent: 43 },
  {
    category: 'Yard equipment',
    utilizationPercent: 66,
    energyIndexPercent: 52,
  },
];

export interface DemoAssetRow {
  readonly asset: AssetSummary;
  readonly operations: DemoAssetOperations;
}

export interface DemoFleetCounts {
  readonly assetCount: number;
  readonly nominalCount: number;
  readonly attentionCount: number;
  readonly criticalCount: number;
  readonly unknownCount: number;
  readonly requiringAttentionCount: number;
  readonly connectedCount: number;
  readonly currentEvidenceCount: number;
  readonly positionedCount: number;
}

export interface DemoFleetOverview {
  readonly source: 'sample';
  readonly asOf: string;
  readonly tenantId: string;
  /** Full fixture set for this tenant, independent of a catalogue page limit. */
  readonly assets: readonly DemoAssetRow[];
  readonly counts: DemoFleetCounts;
  readonly alerts: readonly DemoAlert[];
  readonly trend: readonly DemoTrendPoint[];
  readonly utilization: readonly DemoUtilizationDatum[];
}

/**
 * Builds a labelled sample overview from the full tenant fixture set.
 *
 * Counts are never calculated from a bounded catalogue page, which cannot
 * establish fleet totals. An unknown tenant gets no other tenant's sample
 * operations, alerts, or trend.
 */
export function getDemoOverview(tenantId: string): DemoFleetOverview {
  const assets = PREVIEW_ASSETS.filter(
    (asset) => asset.tenantId === tenantId,
  ).map((asset): DemoAssetRow => {
    const operations = DEMO_ASSET_OPERATIONS[asset.id];
    if (!operations) {
      throw new Error('Missing sample operations for an asset fixture');
    }
    return { asset, operations };
  });
  const assetIds = new Set(assets.map(({ asset }) => asset.id));
  const alerts = DEMO_ALERTS.filter((alert) => assetIds.has(alert.assetId));
  const counts: DemoFleetCounts = {
    assetCount: assets.length,
    nominalCount: assets.filter(
      ({ operations }) => operations.condition === 'nominal',
    ).length,
    attentionCount: assets.filter(
      ({ operations }) => operations.condition === 'attention',
    ).length,
    criticalCount: assets.filter(
      ({ operations }) => operations.condition === 'critical',
    ).length,
    unknownCount: assets.filter(
      ({ operations }) => operations.condition === 'unknown',
    ).length,
    requiringAttentionCount: assets.filter(
      ({ operations }) =>
        operations.condition === 'attention' ||
        operations.condition === 'critical',
    ).length,
    connectedCount: assets.filter(
      ({ operations }) => operations.connectivity === 'connected',
    ).length,
    currentEvidenceCount: assets.filter(
      ({ operations }) => operations.freshness === 'current',
    ).length,
    positionedCount: assets.filter(
      ({ operations }) => operations.mapPosition !== null,
    ).length,
  };

  return {
    source: 'sample',
    asOf: DEMO_SNAPSHOT_AT,
    tenantId,
    assets,
    counts,
    alerts,
    trend: assets.length > 0 ? DEMO_TREND : [],
    utilization: assets.length > 0 ? DEMO_UTILIZATION : [],
  };
}
