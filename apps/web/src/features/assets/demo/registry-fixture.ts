import { PREVIEW_ASSETS } from '../api/fixture-asset-reader';
import type { AssetSummary } from '../model/asset-catalogue';
import type {
  RegistryBindingRevision,
  RegistryDeviceEndpoint,
  RegistryRelationshipRevision,
  RegistryReviewScene,
  RegistrySourceInventoryItem,
} from '../model/registry-review';
import { type DemoInspector, getDemoInspector } from './inspector-fixture';

/** Registry rows include assets without a modeled detail scene. */
export interface RegistryAssetRow {
  readonly asset: AssetSummary;
  readonly modeled: boolean;
}

export type DemoRegistryScene = RegistryReviewScene;

const MODELED_ASSET_IDS = new Set(['asset-004', 'asset-008']);
const RAIL_CORRECTION_RECORDED_AT = Date.parse('2026-09-04T08:00:00Z');
const RAIL_UNKNOWN_BINDING_END_AT = Date.parse('2026-10-06T09:56:00Z');

const RAIL_ENDPOINTS: readonly RegistryDeviceEndpoint[] = [
  {
    deviceAssetId: 'sample-gateway-417',
    id: 'can-traction',
    kind: 'bus.can',
    name: 'Traction CAN interface',
  },
  {
    deviceAssetId: 'sample-gateway-417',
    id: 'can-battery',
    kind: 'bus.can',
    name: 'Battery CAN interface',
  },
];

const TRAILER_ENDPOINTS: readonly RegistryDeviceEndpoint[] = [
  {
    deviceAssetId: 'sample-tracker-011',
    id: 'can-reefer',
    kind: 'bus.can',
    name: 'Refrigeration CAN interface',
  },
];

function relationshipFacts(
  inspector: DemoInspector,
): RegistryRelationshipRevision[] {
  return inspector.relationships.map((relation) => ({
    id: relation.id,
    revision: relation.revision,
    recordedAtMs: Date.parse(relation.recordedAt),
    relationshipType: { id: relation.typeId, version: 1 },
    sourceAssetId: relation.sourceAssetId,
    targetAssetId: relation.targetAssetId,
    effectiveInterval: {
      startMs: Date.parse(relation.effectiveFrom),
      endMs:
        relation.effectiveTo === null ? null : Date.parse(relation.effectiveTo),
    },
  }));
}

function bindingFacts(inspector: DemoInspector): RegistryBindingRevision[] {
  const current = inspector.signals.map((signal) => ({
    id: signal.binding.id,
    revision: signal.binding.revision,
    recordedAtMs: Date.parse(signal.binding.recordedAt),
    source: {
      deviceAssetId: signal.source.deviceAssetId,
      endpointId: signal.source.endpointId,
      signalId: signal.source.signalId,
    },
    target: {
      assetId: signal.binding.targetAssetId,
      property: {
        id: signal.binding.propertyId,
        version: signal.binding.propertyVersion,
      },
    },
    effectiveInterval: {
      startMs: Date.parse(signal.binding.effectiveFrom),
      endMs: null,
    },
  }));
  if (inspector.asset.id !== 'asset-004') return current;

  const corrected = current.find(
    (binding) => binding.id === 'sample-binding-motor-temperature',
  );
  if (!corrected) throw new Error('motor-temperature sample binding is absent');
  return [
    ...current,
    {
      ...corrected,
      revision: '1',
      recordedAtMs: RAIL_CORRECTION_RECORDED_AT,
      target: {
        ...corrected.target,
        assetId: 'sample-motor-b-417',
      },
    },
    {
      id: 'sample-binding-unknown-retired',
      revision: '1',
      recordedAtMs: Date.parse('2026-09-04T09:00:00Z'),
      source: {
        deviceAssetId: 'sample-gateway-417',
        endpointId: 'can-traction',
        signalId: 'can.unknown.027',
      },
      target: {
        assetId: 'sample-motor-b-417',
        property: { id: 'electrical.current', version: 1 },
      },
      effectiveInterval: {
        startMs: Date.parse('2026-09-04T08:00:00Z'),
        endMs: RAIL_UNKNOWN_BINDING_END_AT,
      },
    },
    {
      id: 'sample-binding-aux-traction',
      revision: '1',
      recordedAtMs: Date.parse('2026-09-04T09:00:00Z'),
      source: {
        deviceAssetId: 'sample-gateway-417',
        endpointId: 'can-traction',
        signalId: 'can.aux.current',
      },
      target: {
        assetId: 'sample-motor-417',
        property: { id: 'electrical.current', version: 1 },
      },
      effectiveInterval: {
        startMs: Date.parse('2026-09-04T08:00:00Z'),
        endMs: null,
      },
    },
    {
      id: 'sample-binding-aux-energy',
      revision: '1',
      recordedAtMs: Date.parse('2026-09-04T09:00:00Z'),
      source: {
        deviceAssetId: 'sample-gateway-417',
        endpointId: 'can-traction',
        signalId: 'can.aux.current',
      },
      target: {
        assetId: 'sample-bms-417',
        property: { id: 'electrical.current', version: 1 },
      },
      effectiveInterval: {
        startMs: Date.parse('2026-09-04T08:00:00Z'),
        endMs: null,
      },
    },
  ];
}

function sourceInventory(
  inspector: DemoInspector,
): RegistrySourceInventoryItem[] {
  const mapped = inspector.signals.map((signal) => ({
    id: signal.id,
    label: signal.label,
    source: {
      deviceAssetId: signal.source.deviceAssetId,
      endpointId: signal.source.endpointId,
      signalId: signal.source.signalId,
    },
    observation:
      signal.eventAt === null || signal.receivedAt === null
        ? null
        : {
            eventAtMs: Date.parse(signal.eventAt),
            receivedAtMs: Date.parse(signal.receivedAt),
          },
  }));
  const unmatched = inspector.unattributed.map((item) => ({
    id: item.id,
    label: 'Unassigned CAN source',
    source: {
      deviceAssetId: item.source.deviceAssetId,
      endpointId: item.source.endpointId,
      signalId: item.source.signalId,
    },
    observation: {
      eventAtMs: Date.parse(item.eventAt),
      receivedAtMs: Date.parse(item.receivedAt),
    },
  }));
  if (inspector.asset.id !== 'asset-004') return [...mapped, ...unmatched];
  return [
    ...mapped,
    ...unmatched,
    {
      id: 'sample-source-ambiguous-aux',
      label: 'Auxiliary current',
      source: {
        deviceAssetId: 'sample-gateway-417',
        endpointId: 'can-traction',
        signalId: 'can.aux.current',
      },
      observation: {
        eventAtMs: Date.parse('2026-10-06T09:53:00Z'),
        receivedAtMs: Date.parse('2026-10-06T09:53:31Z'),
      },
    },
  ];
}

/** Tenant-scoped catalogue: unmodeled rows remain distinct from empty detail. */
export function getDemoRegistry(tenantId: string): readonly RegistryAssetRow[] {
  return PREVIEW_ASSETS.filter((asset) => asset.tenantId === tenantId).map(
    (asset) => ({
      asset,
      modeled: MODELED_ASSET_IDS.has(asset.id),
    }),
  );
}

/**
 * Returns one deterministic sample scene. Null means that this asset has no
 * modeled registry detail, not that it has no real relationships or sources.
 */
export function getDemoRegistryDetail(
  tenantId: string,
  assetId: string,
): DemoRegistryScene | null {
  const inspector = getDemoInspector(tenantId, assetId);
  if (!inspector) return null;
  const asOfMs = Date.parse(inspector.asOf);
  return {
    source: 'sample',
    tenantId,
    rootAssetId: assetId,
    asOfMs,
    defaultCutoffs: { effectiveAtMs: asOfMs, knownAtMs: asOfMs },
    nodes: inspector.nodes,
    relationshipRevisions: relationshipFacts(inspector),
    bindingRevisions: bindingFacts(inspector),
    sourceInventory: sourceInventory(inspector),
    deviceEndpoints:
      assetId === 'asset-004' ? RAIL_ENDPOINTS : TRAILER_ENDPOINTS,
    inventoryCoverage: 'complete',
  };
}
