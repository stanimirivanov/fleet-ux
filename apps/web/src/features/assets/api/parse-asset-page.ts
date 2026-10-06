import { Schema } from 'effect';
import {
  type AssetPage,
  type AssetPageRequest,
  isValidAssetIdentifier,
  validateAssetPageRequest,
} from '../model/asset-catalogue';

const WireIdentifier = Schema.String.check(Schema.isMinLength(1));
const WireAssetType = Schema.Struct({
  id: WireIdentifier,
  version: Schema.Int.check(
    Schema.isBetween({ minimum: 1, maximum: 4_294_967_295 }),
  ),
});
const WireAssetSummary = Schema.Struct({
  id: WireIdentifier,
  tenant_id: WireIdentifier,
  name: Schema.String.check(Schema.isMinLength(1)),
  asset_type: WireAssetType,
});
const WireAssetPage = Schema.Struct({
  assets: Schema.Array(WireAssetSummary).check(Schema.isMaxLength(100)),
  next_after: Schema.NullOr(WireIdentifier),
});

/** Invalid or internally inconsistent data received at the catalogue boundary. */
export class AssetPageContractError extends Error {
  override name = 'AssetPageContractError';
}

/**
 * Converts an untrusted HTTP or fixture response into the feature model.
 *
 * Effect Schema checks required fields and primitive bounds. Semantic checks
 * then enforce the selected tenant, requested page size, distinct identities,
 * and a cursor that cannot repeat the request. Extra wire fields are ignored
 * so additive backend fields do not silently enter trusted feature state.
 *
 * Database ordering is intentionally not reproduced in JavaScript: PostgreSQL
 * collation can differ from JavaScript string comparison for Unicode IDs.
 */
export function parseAssetPage(
  input: unknown,
  request: AssetPageRequest,
): AssetPage {
  validateAssetPageRequest(request);

  let wire: typeof WireAssetPage.Type;
  try {
    wire = Schema.decodeUnknownSync(WireAssetPage)(input);
  } catch {
    // Schema errors can include the input; avoid exposing tenant data in logs.
    throw new AssetPageContractError('Invalid asset catalogue response');
  }

  if (wire.assets.length > request.limit) {
    throw new AssetPageContractError(
      'Asset catalogue page exceeds requested limit',
    );
  }

  const seen = new Set<string>();
  for (const asset of wire.assets) {
    if (
      asset.tenant_id !== request.tenantId ||
      !isValidAssetIdentifier(asset.tenant_id) ||
      !isValidAssetIdentifier(asset.id) ||
      !isValidAssetIdentifier(asset.asset_type.id) ||
      seen.has(asset.id) ||
      asset.id === request.after
    ) {
      throw new AssetPageContractError(
        'Asset catalogue contains an invalid asset identity',
      );
    }
    seen.add(asset.id);
  }

  if (
    wire.next_after !== null &&
    (!isValidAssetIdentifier(wire.next_after) ||
      wire.assets.length === 0 ||
      wire.next_after === request.after)
  ) {
    throw new AssetPageContractError(
      'Asset catalogue contains an invalid next cursor',
    );
  }

  return {
    assets: wire.assets.map((asset) => ({
      id: asset.id,
      tenantId: asset.tenant_id,
      name: asset.name,
      assetType: {
        id: asset.asset_type.id,
        version: asset.asset_type.version,
      },
    })),
    nextAfter: wire.next_after,
  };
}
