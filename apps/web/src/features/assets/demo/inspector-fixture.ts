import { PREVIEW_ASSETS } from '../api/fixture-asset-reader';
import type { AssetSummary } from '../model/asset-catalogue';
import type {
  InspectorGraphNode,
  InspectorGraphRelationship,
} from '../model/inspector-selection';
import {
  DEMO_ASSET_OPERATIONS,
  DEMO_SNAPSHOT_AT,
  type DemoAssetOperations,
} from './overview-fixture';

/**
 * Fixed, invented inspector evidence for local design review. The module is
 * imported only by the development preview; it is not an HTTP client or a
 * claim that live asset projections exist.
 */
export interface DemoExternalIdentifier {
  readonly kind: string;
  readonly authority: string | null;
  readonly value: string;
}

export interface DemoTopologyNode extends InspectorGraphNode {
  readonly label: string;
  readonly typeLabel: string;
}

export interface DemoRelationship extends InspectorGraphRelationship {
  readonly id: string;
  readonly typeId: string;
  readonly typeLabel: string;
  readonly revision: string;
  readonly recordedAt: string;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
}

export interface DemoSignalSource {
  readonly deviceAssetId: string;
  readonly endpointId: string;
  readonly signalId: string;
  readonly protocolPackageId: string;
}

export interface DemoSignalBinding {
  readonly id: string;
  readonly revision: string;
  readonly effectiveFrom: string;
  readonly recordedAt: string;
  readonly targetAssetId: string;
  readonly propertyId: string;
  readonly propertyVersion: number;
}

export interface DemoSignalPoint {
  readonly at: string;
  /** Null is a visible evidence gap, never an interpolated measurement. */
  readonly value: number | null;
}

export type DemoSignalQuality = 'good' | 'suspect' | 'not-observed';

export interface DemoSignal {
  readonly id: string;
  readonly label: string;
  /** Display-ready number, or null when the sample contains no observation. */
  readonly value: string | null;
  readonly unit: string | null;
  readonly quality: DemoSignalQuality;
  readonly eventAt: string | null;
  readonly receivedAt: string | null;
  readonly source: DemoSignalSource;
  readonly binding: DemoSignalBinding;
  readonly series: readonly DemoSignalPoint[];
  readonly referenceBand: { readonly min: number; readonly max: number } | null;
}

export interface DemoInspectorEvent {
  readonly id: string;
  readonly targetAssetId: string;
  readonly at: string;
  readonly kind: 'observation' | 'gap' | 'unattributed';
  readonly title: string;
  readonly summary: string;
}

export interface DemoEvidenceGap {
  readonly id: string;
  readonly targetAssetId: string;
  readonly signalId: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly summary: string;
}

export interface DemoUnattributedSignal {
  readonly id: string;
  readonly source: DemoSignalSource;
  readonly eventAt: string;
  readonly receivedAt: string;
  readonly reason: string;
}

export interface DemoInspector {
  readonly source: 'sample';
  readonly asOf: string;
  /** Catalogue-shaped identity; no operating values are added to it. */
  readonly asset: AssetSummary;
  readonly externalIdentifiers: readonly DemoExternalIdentifier[];
  /** Synthetic projection from the existing overview demo data. */
  readonly operations: DemoAssetOperations;
  /** Directed, revisioned sample metadata; not inferred from observations. */
  readonly nodes: readonly DemoTopologyNode[];
  readonly relationships: readonly DemoRelationship[];
  /** Invented values and evidence, separate from identity and graph metadata. */
  readonly signals: readonly DemoSignal[];
  readonly events: readonly DemoInspectorEvent[];
  readonly gaps: readonly DemoEvidenceGap[];
  readonly unattributed: readonly DemoUnattributedSignal[];
}

const RAIL_NODES: readonly DemoTopologyNode[] = [
  {
    id: 'asset-004',
    label: 'Electric locomotive 417',
    kind: 'asset',
    typeLabel: 'Electric locomotive',
  },
  {
    id: 'sample-traction-417',
    label: 'Traction system',
    kind: 'component',
    typeLabel: 'Traction system',
  },
  {
    id: 'sample-motor-417',
    label: 'Traction motor A',
    kind: 'component',
    typeLabel: 'Traction motor',
  },
  {
    id: 'sample-motor-b-417',
    label: 'Traction motor B',
    kind: 'component',
    typeLabel: 'Traction motor',
  },
  {
    id: 'sample-energy-417',
    label: 'Energy system',
    kind: 'component',
    typeLabel: 'Energy system',
  },
  {
    id: 'sample-bms-417',
    label: 'Battery management system',
    kind: 'component',
    typeLabel: 'Battery management system',
  },
  {
    id: 'sample-gateway-417',
    label: 'Telemetry gateway',
    kind: 'device',
    typeLabel: 'Communication device',
  },
];

const RAIL_RELATIONSHIPS: readonly DemoRelationship[] = [
  {
    id: 'sample-relationship-traction-417',
    typeId: 'physical.contains',
    typeLabel: 'Contains',
    revision: '1',
    recordedAt: '2026-09-02T08:00:00Z',
    effectiveFrom: '2026-09-01T00:00:00Z',
    effectiveTo: null,
    sourceAssetId: 'asset-004',
    targetAssetId: 'sample-traction-417',
  },
  {
    id: 'sample-relationship-motor-417',
    typeId: 'physical.contains',
    typeLabel: 'Contains',
    revision: '1',
    recordedAt: '2026-09-02T08:00:00Z',
    effectiveFrom: '2026-09-01T00:00:00Z',
    effectiveTo: null,
    sourceAssetId: 'sample-traction-417',
    targetAssetId: 'sample-motor-417',
  },
  {
    id: 'sample-relationship-motor-b-417',
    typeId: 'physical.contains',
    typeLabel: 'Contains',
    revision: '1',
    recordedAt: '2026-09-02T08:00:00Z',
    effectiveFrom: '2026-09-01T00:00:00Z',
    effectiveTo: null,
    sourceAssetId: 'sample-traction-417',
    targetAssetId: 'sample-motor-b-417',
  },
  {
    id: 'sample-relationship-energy-417',
    typeId: 'physical.contains',
    typeLabel: 'Contains',
    revision: '2',
    recordedAt: '2026-09-02T08:00:00Z',
    effectiveFrom: '2026-09-01T00:00:00Z',
    effectiveTo: null,
    sourceAssetId: 'asset-004',
    targetAssetId: 'sample-energy-417',
  },
  {
    id: 'sample-relationship-bms-417',
    typeId: 'physical.contains',
    typeLabel: 'Contains',
    revision: '2',
    recordedAt: '2026-09-02T08:00:00Z',
    effectiveFrom: '2026-09-01T00:00:00Z',
    effectiveTo: null,
    sourceAssetId: 'sample-energy-417',
    targetAssetId: 'sample-bms-417',
  },
  {
    id: 'sample-relationship-gateway-417',
    typeId: 'physical.contains',
    typeLabel: 'Contains',
    revision: '1',
    recordedAt: '2026-09-03T09:00:00Z',
    effectiveFrom: '2026-09-03T08:00:00Z',
    effectiveTo: null,
    sourceAssetId: 'asset-004',
    targetAssetId: 'sample-gateway-417',
  },
];

const MOTOR_SOURCE: DemoSignalSource = {
  deviceAssetId: 'sample-gateway-417',
  endpointId: 'can-traction',
  signalId: 'traction.motor.temperature',
  protocolPackageId: 'sample.can-gateway',
};

const BATTERY_SOURCE: DemoSignalSource = {
  deviceAssetId: 'sample-gateway-417',
  endpointId: 'can-battery',
  signalId: 'battery.bus.voltage',
  protocolPackageId: 'sample.can-gateway',
};

const RAIL_SIGNALS: readonly DemoSignal[] = [
  {
    id: 'sample-signal-motor-temperature',
    label: 'Motor temperature',
    value: '69.4',
    unit: '°C',
    quality: 'good',
    eventAt: '2026-10-06T09:58:00Z',
    receivedAt: '2026-10-06T09:58:30Z',
    source: MOTOR_SOURCE,
    binding: {
      id: 'sample-binding-motor-temperature',
      revision: '2',
      effectiveFrom: '2026-09-04T08:00:00Z',
      recordedAt: '2026-09-04T09:00:00Z',
      targetAssetId: 'sample-motor-417',
      propertyId: 'thermal.temperature',
      propertyVersion: 1,
    },
    series: [
      { at: '2026-10-06T04:30:00Z', value: 62.1 },
      { at: '2026-10-06T05:30:00Z', value: 63.5 },
      { at: '2026-10-06T06:45:00Z', value: 64.8 },
      { at: '2026-10-06T07:30:00Z', value: 65.2 },
      { at: '2026-10-06T08:30:00Z', value: 66.1 },
      { at: '2026-10-06T09:46:00Z', value: null },
      { at: '2026-10-06T09:49:00Z', value: 67.4 },
      { at: '2026-10-06T09:58:00Z', value: 69.4 },
    ],
    referenceBand: { min: 0, max: 85 },
  },
  {
    id: 'sample-signal-traction-power',
    label: 'Traction power',
    value: '412',
    unit: 'kW',
    quality: 'good',
    eventAt: '2026-10-06T09:58:00Z',
    receivedAt: '2026-10-06T09:58:32Z',
    source: {
      deviceAssetId: 'sample-gateway-417',
      endpointId: 'can-traction',
      signalId: 'traction.motor.power',
      protocolPackageId: 'sample.can-gateway',
    },
    binding: {
      id: 'sample-binding-traction-power',
      revision: '1',
      effectiveFrom: '2026-09-04T08:00:00Z',
      recordedAt: '2026-09-04T09:00:00Z',
      targetAssetId: 'sample-motor-417',
      propertyId: 'electrical.power',
      propertyVersion: 1,
    },
    series: [
      { at: '2026-10-06T04:30:00Z', value: 330 },
      { at: '2026-10-06T05:30:00Z', value: 352 },
      { at: '2026-10-06T06:45:00Z', value: 389 },
      { at: '2026-10-06T07:30:00Z', value: 371 },
      { at: '2026-10-06T08:30:00Z', value: 426 },
      { at: '2026-10-06T09:30:00Z', value: 398 },
      { at: '2026-10-06T09:58:00Z', value: 412 },
    ],
    referenceBand: { min: 0, max: 600 },
  },
  {
    id: 'sample-signal-battery-voltage',
    label: 'Battery bus voltage',
    value: '752',
    unit: 'V',
    quality: 'good',
    eventAt: '2026-10-06T09:57:00Z',
    receivedAt: '2026-10-06T09:57:25Z',
    source: BATTERY_SOURCE,
    binding: {
      id: 'sample-binding-battery-voltage',
      revision: '1',
      effectiveFrom: '2026-09-04T08:00:00Z',
      recordedAt: '2026-09-04T09:00:00Z',
      targetAssetId: 'sample-bms-417',
      propertyId: 'electrical.voltage',
      propertyVersion: 1,
    },
    series: [
      { at: '2026-10-06T04:30:00Z', value: 744 },
      { at: '2026-10-06T05:30:00Z', value: 746 },
      { at: '2026-10-06T06:45:00Z', value: 749 },
      { at: '2026-10-06T07:30:00Z', value: 747 },
      { at: '2026-10-06T08:30:00Z', value: 751 },
      { at: '2026-10-06T09:30:00Z', value: 750 },
      { at: '2026-10-06T09:57:00Z', value: 752 },
    ],
    referenceBand: { min: 680, max: 820 },
  },
];

const RAIL_GAPS: readonly DemoEvidenceGap[] = [
  {
    id: 'sample-gap-motor-417',
    targetAssetId: 'sample-motor-417',
    signalId: 'sample-signal-motor-temperature',
    startAt: '2026-10-06T09:44:00Z',
    endAt: '2026-10-06T09:48:00Z',
    summary: 'Four minutes without a motor-temperature observation.',
  },
];

const RAIL_UNATTRIBUTED: readonly DemoUnattributedSignal[] = [
  {
    id: 'sample-unattributed-can-027',
    source: {
      deviceAssetId: 'sample-gateway-417',
      endpointId: 'can-traction',
      signalId: 'can.unknown.027',
      protocolPackageId: 'sample.can-gateway',
    },
    eventAt: '2026-10-06T09:56:00Z',
    receivedAt: '2026-10-06T09:56:35Z',
    reason: 'No matching semantic binding at the sample knowledge cutoff.',
  },
];

const RAIL_EVENTS: readonly DemoInspectorEvent[] = [
  {
    id: 'sample-event-motor-reading',
    targetAssetId: 'sample-motor-417',
    at: '2026-10-06T09:58:00Z',
    kind: 'observation',
    title: 'Motor temperature observed',
    summary: '69.4 °C with good source quality.',
  },
  {
    id: 'sample-event-unattributed',
    targetAssetId: 'sample-gateway-417',
    at: '2026-10-06T09:56:00Z',
    kind: 'unattributed',
    title: 'Unattributed CAN signal',
    summary: 'One decoded source has no matching semantic binding.',
  },
  {
    id: 'sample-event-motor-gap',
    targetAssetId: 'sample-motor-417',
    at: '2026-10-06T09:44:00Z',
    kind: 'gap',
    title: 'Motor stream gap',
    summary: 'The sample stream resumes after four minutes.',
  },
];

const TRAILER_NODES: readonly DemoTopologyNode[] = [
  {
    id: 'asset-008',
    label: 'Refrigerated trailer 11',
    kind: 'asset',
    typeLabel: 'Refrigerated trailer',
  },
  {
    id: 'sample-freezer-011',
    label: 'Refrigeration unit',
    kind: 'component',
    typeLabel: 'Refrigeration unit',
  },
  {
    id: 'sample-tracker-011',
    label: 'Trailer tracker',
    kind: 'device',
    typeLabel: 'Communication device',
  },
];

const TRAILER_RELATIONSHIPS: readonly DemoRelationship[] = [
  {
    id: 'sample-relationship-freezer-011',
    typeId: 'physical.contains',
    typeLabel: 'Contains',
    revision: '1',
    recordedAt: '2026-09-10T09:00:00Z',
    effectiveFrom: '2026-09-10T08:00:00Z',
    effectiveTo: null,
    sourceAssetId: 'asset-008',
    targetAssetId: 'sample-freezer-011',
  },
  {
    id: 'sample-relationship-tracker-011',
    typeId: 'physical.contains',
    typeLabel: 'Contains',
    revision: '1',
    recordedAt: '2026-09-10T09:00:00Z',
    effectiveFrom: '2026-09-10T08:00:00Z',
    effectiveTo: null,
    sourceAssetId: 'asset-008',
    targetAssetId: 'sample-tracker-011',
  },
];

const TRAILER_SIGNALS: readonly DemoSignal[] = [
  {
    id: 'sample-signal-freezer-air',
    label: 'Freezer air temperature',
    value: null,
    unit: '°C',
    quality: 'not-observed',
    eventAt: null,
    receivedAt: null,
    source: {
      deviceAssetId: 'sample-tracker-011',
      endpointId: 'can-reefer',
      signalId: 'freezer.air.temperature',
      protocolPackageId: 'sample.refrigeration-tracker',
    },
    binding: {
      id: 'sample-binding-freezer-air',
      revision: '1',
      effectiveFrom: '2026-09-10T08:00:00Z',
      recordedAt: '2026-09-10T09:00:00Z',
      targetAssetId: 'sample-freezer-011',
      propertyId: 'thermal.air-temperature',
      propertyVersion: 1,
    },
    series: [],
    referenceBand: { min: -22, max: -14 },
  },
];

const TRAILER_GAPS: readonly DemoEvidenceGap[] = [
  {
    id: 'sample-gap-freezer-011',
    targetAssetId: 'sample-freezer-011',
    signalId: 'sample-signal-freezer-air',
    startAt: '2026-10-06T09:00:00Z',
    endAt: DEMO_SNAPSHOT_AT,
    summary: 'No freezer observations in the illustrated hour.',
  },
];

/**
 * Returns detail for the two illustrated assets only. Null means the caller
 * should render an unknown or empty inspector state, never borrow another
 * asset's evidence. The tenant check prevents cross-tenant fixture leakage.
 */
export function getDemoInspector(
  tenantId: string,
  assetId: string,
): DemoInspector | null {
  const asset = PREVIEW_ASSETS.find(
    (candidate) => candidate.tenantId === tenantId && candidate.id === assetId,
  );
  const operations = DEMO_ASSET_OPERATIONS[assetId];
  if (!asset || !operations) return null;

  if (assetId === 'asset-004') {
    return {
      source: 'sample',
      asOf: DEMO_SNAPSHOT_AT,
      asset,
      externalIdentifiers: [
        {
          kind: 'fleet_number',
          authority: 'Northern Corridor Operations',
          value: 'NC-417',
        },
      ],
      operations,
      nodes: RAIL_NODES,
      relationships: RAIL_RELATIONSHIPS,
      signals: RAIL_SIGNALS,
      events: RAIL_EVENTS,
      gaps: RAIL_GAPS,
      unattributed: RAIL_UNATTRIBUTED,
    };
  }

  if (assetId === 'asset-008') {
    return {
      source: 'sample',
      asOf: DEMO_SNAPSHOT_AT,
      asset,
      externalIdentifiers: [
        {
          kind: 'fleet_number',
          authority: 'Northern Corridor Operations',
          value: 'TRL-011',
        },
      ],
      operations,
      nodes: TRAILER_NODES,
      relationships: TRAILER_RELATIONSHIPS,
      signals: TRAILER_SIGNALS,
      events: [],
      gaps: TRAILER_GAPS,
      unattributed: [],
    };
  }

  return null;
}
