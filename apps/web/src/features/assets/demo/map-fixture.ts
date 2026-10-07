import { PREVIEW_ASSETS } from '../api/fixture-asset-reader';
import type { AssetSummary } from '../model/asset-catalogue';
import {
  DEMO_ASSET_OPERATIONS,
  DEMO_SNAPSHOT_AT,
  type DemoAssetOperations,
  type DemoMapPosition,
} from './overview-fixture';

/**
 * A position observation is separate from telemetry freshness and device
 * connectivity. Coordinates are percentages on an illustrative canvas, not
 * latitude/longitude or a claim about a real location provider.
 */
export interface DemoMapLocation {
  readonly assetId: string;
  readonly position: DemoMapPosition | null;
  readonly observedAt: string | null;
  readonly receivedAt: string | null;
  readonly state: 'recent' | 'last-known' | 'unavailable';
  readonly quality: 'good' | 'suspect' | 'unavailable';
  readonly sourceLabel: string | null;
  readonly siteLabel: string;
}

export interface DemoMapAsset {
  readonly asset: AssetSummary;
  readonly operations: DemoAssetOperations;
  readonly location: DemoMapLocation;
}

export interface DemoMapWorkbench {
  readonly source: 'sample';
  /** Fixed fixture cutoff. "Recent" is relative to this time, not now. */
  readonly asOf: string;
  readonly tenantId: string;
  readonly assets: readonly DemoMapAsset[];
}

type PositionEvidence = Pick<
  DemoMapLocation,
  'observedAt' | 'receivedAt' | 'state' | 'quality' | 'sourceLabel'
>;

/**
 * Invented position evidence keyed to the asset fixture. It deliberately
 * differs from telemetry freshness: asset-001 has current telemetry but only
 * a last-known position; asset-005 has stale telemetry but a recent position.
 * No coordinate is synthesized from a site label or a tracker identity.
 */
const POSITION_EVIDENCE: Readonly<Record<string, PositionEvidence>> = {
  'asset-001': {
    observedAt: '2026-10-06T08:00:00Z',
    receivedAt: '2026-10-06T08:00:35Z',
    state: 'last-known',
    quality: 'suspect',
    sourceLabel: 'Illustrative position feed',
  },
  'asset-002': {
    observedAt: '2026-10-06T09:51:00Z',
    receivedAt: '2026-10-06T09:51:20Z',
    state: 'recent',
    quality: 'good',
    sourceLabel: 'Illustrative position feed',
  },
  'asset-003': {
    observedAt: '2026-10-06T08:08:00Z',
    receivedAt: '2026-10-06T08:08:41Z',
    state: 'last-known',
    quality: 'suspect',
    sourceLabel: 'Illustrative position feed',
  },
  'asset-004': {
    observedAt: '2026-10-06T09:57:00Z',
    receivedAt: '2026-10-06T09:57:24Z',
    state: 'recent',
    quality: 'good',
    sourceLabel: 'Illustrative position feed',
  },
  'asset-005': {
    observedAt: '2026-10-06T09:56:00Z',
    receivedAt: '2026-10-06T09:56:18Z',
    state: 'recent',
    quality: 'good',
    sourceLabel: 'Illustrative position feed',
  },
  'asset-006': {
    observedAt: '2026-10-06T09:48:00Z',
    receivedAt: '2026-10-06T09:48:29Z',
    state: 'recent',
    quality: 'good',
    sourceLabel: 'Illustrative position feed',
  },
  'asset-007': {
    observedAt: '2026-10-06T09:54:00Z',
    receivedAt: '2026-10-06T09:54:33Z',
    state: 'recent',
    quality: 'good',
    sourceLabel: 'Illustrative position feed',
  },
  'asset-008': {
    observedAt: null,
    receivedAt: null,
    state: 'unavailable',
    quality: 'unavailable',
    sourceLabel: null,
  },
};

/**
 * Builds the full, tenant-scoped sample set. This is a development fixture,
 * never a live map read model or geospatial API response.
 */
export function getDemoMapWorkbench(tenantId: string): DemoMapWorkbench {
  const assets = PREVIEW_ASSETS.filter(
    (asset) => asset.tenantId === tenantId,
  ).map((asset): DemoMapAsset => {
    const operations = DEMO_ASSET_OPERATIONS[asset.id];
    const evidence = POSITION_EVIDENCE[asset.id];
    if (!operations || !evidence) {
      throw new Error('Missing sample map evidence for an asset fixture');
    }
    const location: DemoMapLocation = {
      assetId: asset.id,
      position: operations.mapPosition,
      siteLabel: operations.siteLabel,
      ...evidence,
    };
    if (
      (location.position === null) !== (location.state === 'unavailable') ||
      (location.observedAt === null) !== (location.state === 'unavailable') ||
      (location.receivedAt === null) !== (location.state === 'unavailable')
    ) {
      throw new Error('Inconsistent sample position evidence');
    }
    return { asset, operations, location };
  });
  return { source: 'sample', asOf: DEMO_SNAPSHOT_AT, tenantId, assets };
}
