import { RequestFailure } from '#shared/model';
import {
  type AssetCatalogueReader,
  type AssetReadOptions,
  type AssetSummary,
  isValidAssetIdentifier,
} from './asset-catalogue';

export interface DefinitionRef {
  readonly id: string;
  readonly version: number;
}

export interface ExternalIdentifier {
  readonly kind: string;
  readonly authority: string | null;
  readonly value: string;
}

export interface AssetDetail extends AssetSummary {
  readonly externalIdentifiers: readonly ExternalIdentifier[];
}

export interface AssetTypeDefinition extends DefinitionRef {
  readonly name: string;
  readonly supportedProperties: readonly DefinitionRef[];
}

export interface PropertyDefinition extends DefinitionRef {
  readonly name: string;
  readonly valueKind: 'boolean' | 'integer' | 'decimal' | 'text';
  readonly canonicalUnit: string | null;
}

export interface RelationshipTypeDefinition extends DefinitionRef {
  readonly name: string;
}

export interface SignalSource {
  readonly deviceAssetId: string;
  readonly endpointId: string;
  readonly signalId: string;
}

export interface EffectiveInterval {
  readonly startMs: number;
  readonly endMs: number | null;
}

export interface Relationship {
  readonly id: string;
  readonly tenantId: string;
  /** Decimal u64 text; never converted to a JavaScript number. */
  readonly revision: string;
  readonly recordedAtMs: number;
  readonly relationshipType: DefinitionRef;
  readonly sourceAssetId: string;
  readonly targetAssetId: string;
  readonly effectiveInterval: EffectiveInterval;
}

export interface SignalBinding {
  readonly id: string;
  readonly tenantId: string;
  readonly revision: string;
  readonly recordedAtMs: number;
  readonly source: SignalSource;
  readonly target: {
    readonly assetId: string;
    readonly property: DefinitionRef;
  };
  readonly effectiveInterval: EffectiveInterval;
}

export interface AssetRequest {
  readonly tenantId: string;
  readonly assetId: string;
}

export interface DefinitionRequest extends DefinitionRef {
  readonly tenantId: string;
}

export interface SnapshotRequest {
  readonly tenantId: string;
  readonly effectiveAtMs: number;
  readonly knownAtMs: number;
  readonly limit: number;
  readonly after?: string;
}

export interface AssetSnapshotRequest extends SnapshotRequest {
  readonly assetId: string;
}

export interface SourceSnapshotRequest extends SnapshotRequest {
  readonly source: SignalSource;
}

/** One bounded page; this is not a complete asset graph or historical identity. */
export interface RelationshipPage {
  readonly assetId: string;
  readonly effectiveAtMs: number;
  readonly knownAtMs: number;
  readonly relationships: readonly Relationship[];
  readonly nextAfter: string | null;
}

export interface TargetBindingPage {
  readonly assetId: string;
  readonly effectiveAtMs: number;
  readonly knownAtMs: number;
  readonly bindings: readonly SignalBinding[];
  readonly nextAfter: string | null;
}

/** Exact-source page; it does not assert an inventory or device existence. */
export interface SourceBindingPage {
  readonly source: SignalSource;
  readonly effectiveAtMs: number;
  readonly knownAtMs: number;
  readonly bindings: readonly SignalBinding[];
  readonly nextAfter: string | null;
}

export interface MetadataReader extends AssetCatalogueReader {
  getAsset(
    request: AssetRequest,
    options?: AssetReadOptions,
  ): Promise<AssetDetail>;
  getAssetType(
    request: DefinitionRequest,
    options?: AssetReadOptions,
  ): Promise<AssetTypeDefinition>;
  getProperty(
    request: DefinitionRequest,
    options?: AssetReadOptions,
  ): Promise<PropertyDefinition>;
  getRelationshipType(
    request: DefinitionRequest,
    options?: AssetReadOptions,
  ): Promise<RelationshipTypeDefinition>;
  listRelationships(
    request: AssetSnapshotRequest,
    options?: AssetReadOptions,
  ): Promise<RelationshipPage>;
  listTargetBindings(
    request: AssetSnapshotRequest,
    options?: AssetReadOptions,
  ): Promise<TargetBindingPage>;
  listSourceBindings(
    request: SourceSnapshotRequest,
    options?: AssetReadOptions,
  ): Promise<SourceBindingPage>;
}

export function validateAssetRequest(request: AssetRequest): void {
  requireIdentifier(request.tenantId);
  requireIdentifier(request.assetId);
}

export function validateDefinitionRequest(request: DefinitionRequest): void {
  requireIdentifier(request.tenantId);
  requireIdentifier(request.id);
  if (!isDefinitionVersion(request.version))
    throw new RequestFailure('invalid-request');
}

export function validateSnapshotRequest(request: SnapshotRequest): void {
  requireIdentifier(request.tenantId);
  if (
    !Number.isSafeInteger(request.effectiveAtMs) ||
    !Number.isSafeInteger(request.knownAtMs) ||
    !Number.isInteger(request.limit) ||
    request.limit < 1 ||
    request.limit > 100 ||
    (request.after !== undefined && !isValidAssetIdentifier(request.after))
  )
    throw new RequestFailure('invalid-request');
}

export function validateSourceRequest(request: SourceSnapshotRequest): void {
  validateSnapshotRequest(request);
  requireIdentifier(request.source.deviceAssetId);
  requireIdentifier(request.source.endpointId);
  requireIdentifier(request.source.signalId);
}

export function isDefinitionVersion(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 1 && value <= 4_294_967_295;
}

export function isRevision(value: string): boolean {
  return (
    /^[1-9][0-9]{0,19}$/.test(value) &&
    (value.length < 20 || value <= '18446744073709551615')
  );
}

function requireIdentifier(value: string): void {
  if (!isValidAssetIdentifier(value))
    throw new RequestFailure('invalid-request');
}
