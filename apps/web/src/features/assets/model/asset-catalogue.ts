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

/** Optional transport cancellation owned by the caller. */
export interface AssetReadOptions {
  readonly signal?: AbortSignal;
}

/** The feature-facing read port shared by preview and future HTTP adapters. */
export interface AssetCatalogueReader {
  listPage(
    request: AssetPageRequest,
    options?: AssetReadOptions,
  ): Promise<AssetPage>;
}

/** A malformed request rejected before an adapter reads. */
export class AssetPageRequestError extends RangeError {
  override name = 'AssetPageRequestError';
}

/** Invalid or internally inconsistent data received at the catalogue boundary. */
export class AssetPageContractError extends Error {
  override name = 'AssetPageContractError';
  constructor(
    message: string,
    readonly paths: readonly string[] = [],
  ) {
    super(message);
  }
}

/** Failures that the catalogue can explain without exposing adapter internals. */
export type AssetCatalogueLoadFailure =
  | { readonly kind: 'invalid-request' }
  | { readonly kind: 'invalid-response' }
  | { readonly kind: 'unavailable' };

/** Normalizes rejected adapter values into a safe presentation category. */
export function classifyAssetCatalogueFailure(
  cause: unknown,
): AssetCatalogueLoadFailure {
  if (cause instanceof AssetPageRequestError) {
    return { kind: 'invalid-request' };
  }
  if (cause instanceof AssetPageContractError) {
    return { kind: 'invalid-response' };
  }
  return { kind: 'unavailable' };
}

/**
 * Checks request invariants before an adapter makes a read.
 *
 * Server authorization is still required; this only prevents malformed client
 * requests and makes preview behavior consistent with the protected endpoint.
 */
export function validateAssetPageRequest(request: AssetPageRequest): void {
  if (!isValidAssetIdentifier(request.tenantId)) {
    throw new AssetPageRequestError('Asset catalogue tenant ID is invalid');
  }
  if (
    !Number.isInteger(request.limit) ||
    request.limit < 1 ||
    request.limit > 100
  ) {
    throw new AssetPageRequestError(
      'Asset catalogue page limit must be between 1 and 100',
    );
  }
  if (request.after !== undefined && !isValidAssetIdentifier(request.after)) {
    throw new AssetPageRequestError('Asset catalogue cursor is invalid');
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
