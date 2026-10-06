import { Result, Schema, SchemaIssue } from 'effect';
import { AssetPage as WireAssetPage } from '../../../generated/fleetiq-api';
import {
  type AssetPage,
  AssetPageContractError,
  type AssetPageRequest,
  isValidAssetIdentifier,
  validateAssetPageRequest,
} from '../model/asset-catalogue';

export { AssetPageContractError } from '../model/asset-catalogue';

const allowedFields = new Set([
  'assets',
  'id',
  'tenant_id',
  'name',
  'asset_type',
  'version',
  'next_after',
]);

/**
 * Retains only schema property paths, never decoder messages or input values.
 * Unknown property names are redacted because they may originate in payloads.
 */
function redactedIssuePaths(issue: SchemaIssue.Issue): readonly string[] {
  const formatted = SchemaIssue.makeFormatterStandardSchemaV1()(issue);
  return [
    ...new Set(
      formatted.issues.map((entry) => {
        let path = '$';
        for (const segment of entry.path ?? []) {
          const key = typeof segment === 'object' ? segment.key : segment;
          if (typeof key === 'number') {
            path +=
              Number.isSafeInteger(key) && key >= 0 ? `[${key}]` : '[index]';
          } else if (typeof key === 'string') {
            path += `.${allowedFields.has(key) ? key : '[field]'}`;
          } else {
            path += '.[field]';
          }
        }
        return path;
      }),
    ),
  ].slice(0, 10);
}

/**
 * Converts an untrusted HTTP or fixture response into the feature model.
 *
 * The generated Effect Schema checks required fields and primitive bounds. Semantic checks
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

  const decoded = Schema.decodeUnknownResult(WireAssetPage)(input);
  if (Result.isFailure(decoded)) {
    throw new AssetPageContractError(
      'Invalid asset catalogue response',
      redactedIssuePaths(decoded.failure.issue),
    );
  }
  const wire = decoded.success;

  if (wire.assets.length > request.limit) {
    throw new AssetPageContractError(
      'Asset catalogue page exceeds requested limit',
      ['$.assets'],
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
        ['$.assets'],
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
      ['$.next_after'],
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
