import { Result, Schema } from 'effect';
import { RequestFailure } from '#shared/model';
import {
  Asset,
  AssetBindingSnapshot,
  RelationshipSnapshot,
  SourceBindingSnapshot,
  AssetTypeDefinition as WireAssetTypeDefinition,
  PropertyDefinition as WirePropertyDefinition,
  RelationshipTypeDefinition as WireRelationshipTypeDefinition,
} from '../../../generated/fleetiq-api';
import { isValidAssetIdentifier } from '../model/asset-catalogue';
import {
  type AssetDetail,
  type AssetRequest,
  type AssetSnapshotRequest,
  type AssetTypeDefinition,
  type DefinitionRef,
  type DefinitionRequest,
  type EffectiveInterval,
  isDefinitionVersion,
  isRevision,
  type PropertyDefinition,
  type Relationship,
  type RelationshipPage,
  type RelationshipTypeDefinition,
  type SignalBinding,
  type SignalSource,
  type SnapshotRequest,
  type SourceBindingPage,
  type SourceSnapshotRequest,
  type TargetBindingPage,
} from '../model/metadata';

function invalid(): never {
  throw new RequestFailure('invalid-response');
}

function decode<S extends Schema.ConstraintDecoder<unknown, never>>(
  schema: S,
  input: unknown,
): S['Type'] {
  const result = Schema.decodeUnknownResult(schema)(input);
  if (Result.isFailure(result)) invalid();
  return result.success;
}

function identifier(value: string): string {
  if (!isValidAssetIdentifier(value)) invalid();
  return value;
}

function reference(value: {
  readonly id: string;
  readonly version: number;
}): DefinitionRef {
  if (!isDefinitionVersion(value.version)) invalid();
  return { id: identifier(value.id), version: value.version };
}

function exactDefinition(
  value: DefinitionRef,
  request: DefinitionRequest,
): void {
  if (value.id !== request.id || value.version !== request.version) invalid();
}

export function parseAssetDetail(
  input: unknown,
  request: AssetRequest,
): AssetDetail {
  const wire = decode(Asset, input);
  if (wire.id !== request.assetId || wire.tenant_id !== request.tenantId)
    invalid();
  return {
    id: identifier(wire.id),
    tenantId: identifier(wire.tenant_id),
    name: wire.name,
    assetType: reference(wire.asset_type),
    externalIdentifiers: wire.external_identifiers.map((entry) => ({
      kind: identifier(entry.kind),
      authority: entry.authority === null ? null : identifier(entry.authority),
      value: entry.value,
    })),
  };
}

export function parseAssetType(
  input: unknown,
  request: DefinitionRequest,
): AssetTypeDefinition {
  const wire = decode(WireAssetTypeDefinition, input);
  const ref = reference(wire);
  exactDefinition(ref, request);
  const supportedProperties = wire.supported_properties.map(reference);
  const keys = supportedProperties.map((property) =>
    JSON.stringify([property.id, property.version]),
  );
  if (new Set(keys).size !== keys.length) invalid();
  return { ...ref, name: wire.name, supportedProperties };
}

export function parseProperty(
  input: unknown,
  request: DefinitionRequest,
): PropertyDefinition {
  const wire = decode(WirePropertyDefinition, input);
  const ref = reference(wire);
  exactDefinition(ref, request);
  return {
    ...ref,
    name: wire.name,
    valueKind: wire.value_kind,
    canonicalUnit: wire.canonical_unit,
  };
}

export function parseRelationshipType(
  input: unknown,
  request: DefinitionRequest,
): RelationshipTypeDefinition {
  const wire = decode(WireRelationshipTypeDefinition, input);
  const ref = reference(wire);
  exactDefinition(ref, request);
  return { ...ref, name: wire.name };
}

function interval(
  wire: { readonly start_ms: number; readonly end_ms: number | null },
  request: SnapshotRequest,
): EffectiveInterval {
  if (
    !Number.isSafeInteger(wire.start_ms) ||
    (wire.end_ms !== null &&
      (!Number.isSafeInteger(wire.end_ms) || wire.end_ms <= wire.start_ms)) ||
    wire.start_ms > request.effectiveAtMs ||
    (wire.end_ms !== null && wire.end_ms <= request.effectiveAtMs)
  )
    invalid();
  return { startMs: wire.start_ms, endMs: wire.end_ms };
}

function source(wire: {
  readonly device_asset_id: string;
  readonly endpoint_id: string;
  readonly signal_id: string;
}): SignalSource {
  return {
    deviceAssetId: identifier(wire.device_asset_id),
    endpointId: identifier(wire.endpoint_id),
    signalId: identifier(wire.signal_id),
  };
}

function sameSource(left: SignalSource, right: SignalSource): boolean {
  return (
    left.deviceAssetId === right.deviceAssetId &&
    left.endpointId === right.endpointId &&
    left.signalId === right.signalId
  );
}

function revision(
  wire: {
    readonly tenant_id: string;
    readonly revision: string;
    readonly recorded_at_ms: number;
  },
  request: SnapshotRequest,
): void {
  if (
    wire.tenant_id !== request.tenantId ||
    !isRevision(wire.revision) ||
    !Number.isSafeInteger(wire.recorded_at_ms) ||
    wire.recorded_at_ms > request.knownAtMs
  )
    invalid();
}

function page(
  wire: {
    readonly effective_at_ms: number;
    readonly known_at_ms: number;
    readonly next_after: string | null;
  },
  records: readonly { readonly id: string }[],
  request: SnapshotRequest,
): void {
  if (
    !Number.isSafeInteger(wire.effective_at_ms) ||
    !Number.isSafeInteger(wire.known_at_ms) ||
    wire.effective_at_ms !== request.effectiveAtMs ||
    wire.known_at_ms !== request.knownAtMs ||
    records.length > request.limit ||
    new Set(records.map((record) => record.id)).size !== records.length ||
    records.some((record) => record.id === request.after)
  )
    invalid();
  if (
    wire.next_after !== null &&
    (!isValidAssetIdentifier(wire.next_after) ||
      wire.next_after === request.after ||
      records.at(-1)?.id !== wire.next_after)
  )
    invalid();
}

export function parseRelationshipPage(
  input: unknown,
  request: AssetSnapshotRequest,
): RelationshipPage {
  const wire = decode(RelationshipSnapshot, input);
  if (wire.asset_id !== request.assetId) invalid();
  const relationships: Relationship[] = wire.relationships.map((entry) => {
    revision(entry, request);
    if (
      entry.source_asset_id !== request.assetId &&
      entry.target_asset_id !== request.assetId
    )
      invalid();
    return {
      id: identifier(entry.id),
      tenantId: identifier(entry.tenant_id),
      revision: entry.revision,
      recordedAtMs: entry.recorded_at_ms,
      relationshipType: reference(entry.relationship_type),
      sourceAssetId: identifier(entry.source_asset_id),
      targetAssetId: identifier(entry.target_asset_id),
      effectiveInterval: interval(entry.effective_interval, request),
    };
  });
  page(wire, relationships, request);
  return {
    assetId: identifier(wire.asset_id),
    effectiveAtMs: wire.effective_at_ms,
    knownAtMs: wire.known_at_ms,
    relationships,
    nextAfter: wire.next_after,
  };
}

function binding(
  entry: (typeof AssetBindingSnapshot.Type.bindings)[number],
  request: SnapshotRequest,
): SignalBinding {
  revision(entry, request);
  return {
    id: identifier(entry.id),
    tenantId: identifier(entry.tenant_id),
    revision: entry.revision,
    recordedAtMs: entry.recorded_at_ms,
    source: source(entry.source),
    target: {
      assetId: identifier(entry.target.asset_id),
      property: reference(entry.target.property),
    },
    effectiveInterval: interval(entry.effective_interval, request),
  };
}

export function parseTargetBindingPage(
  input: unknown,
  request: AssetSnapshotRequest,
): TargetBindingPage {
  const wire = decode(AssetBindingSnapshot, input);
  if (wire.asset_id !== request.assetId) invalid();
  const bindings = wire.bindings.map((entry) => binding(entry, request));
  if (bindings.some((entry) => entry.target.assetId !== request.assetId))
    invalid();
  page(wire, bindings, request);
  return {
    assetId: identifier(wire.asset_id),
    effectiveAtMs: wire.effective_at_ms,
    knownAtMs: wire.known_at_ms,
    bindings,
    nextAfter: wire.next_after,
  };
}

export function parseSourceBindingPage(
  input: unknown,
  request: SourceSnapshotRequest,
): SourceBindingPage {
  const wire = decode(SourceBindingSnapshot, input);
  const selectedSource = source(wire.source);
  if (!sameSource(selectedSource, request.source)) invalid();
  const bindings = wire.bindings.map((entry) => binding(entry, request));
  if (bindings.some((entry) => !sameSource(entry.source, request.source)))
    invalid();
  page(wire, bindings, request);
  return {
    source: selectedSource,
    effectiveAtMs: wire.effective_at_ms,
    knownAtMs: wire.known_at_ms,
    bindings,
    nextAfter: wire.next_after,
  };
}
