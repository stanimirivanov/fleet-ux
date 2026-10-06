/** Asset catalogue values after the HTTP response has been validated. */
export interface AssetTypeRef {
  readonly id: string;
  readonly version: number;
}

export interface AssetSummary {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly assetType: AssetTypeRef;
}

export interface AssetPage {
  readonly assets: readonly AssetSummary[];
  /** Opaque exclusive cursor supplied by the server; null ends traversal. */
  readonly nextAfter: string | null;
}

export interface AssetPageRequest {
  readonly tenantId: string;
  readonly limit: number;
  readonly after?: string;
}

/** The feature-facing read port shared by preview and future HTTP adapters. */
export interface AssetCatalogueReader {
  listPage(request: AssetPageRequest): Promise<AssetPage>;
}

/**
 * Checks request invariants before an adapter makes a read.
 *
 * Server authorization is still required; this only prevents malformed client
 * requests and makes preview behavior consistent with the protected endpoint.
 */
export function validateAssetPageRequest(request: AssetPageRequest): void {
  if (!isValidAssetIdentifier(request.tenantId)) {
    throw new RangeError('Asset catalogue tenant ID is invalid');
  }
  if (
    !Number.isInteger(request.limit) ||
    request.limit < 1 ||
    request.limit > 100
  ) {
    throw new RangeError(
      'Asset catalogue page limit must be between 1 and 100',
    );
  }
  if (request.after !== undefined && !isValidAssetIdentifier(request.after)) {
    throw new RangeError('Asset catalogue cursor is invalid');
  }
}

/** Mirrors the backend's identifier bounds without assigning asset-kind meaning. */
export function isValidAssetIdentifier(value: string): boolean {
  return (
    value.length > 0 &&
    [...value].length <= 128 &&
    value.trim() === value &&
    !/\p{Cc}/u.test(value)
  );
}
