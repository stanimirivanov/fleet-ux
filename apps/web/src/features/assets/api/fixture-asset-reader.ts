import {
  type AssetCatalogueReader,
  type AssetPageRequest,
  type AssetReadOptions,
  type AssetSummary,
  validateAssetPageRequest,
} from '../model/asset-catalogue';
import { parseAssetPage } from './parse-asset-page';

/**
 * Clearly synthetic, equipment-neutral records for explicit local preview.
 * Importing this adapter never configures the application or production build.
 */
export const PREVIEW_ASSETS: readonly AssetSummary[] = [
  {
    id: 'asset-001',
    tenantId: 'tenant-a',
    name: 'Primary machine',
    assetType: { id: 'generic.machine', version: 1 },
  },
  {
    id: 'asset-002',
    tenantId: 'tenant-a',
    name: 'Power system',
    assetType: { id: 'generic.power-system', version: 1 },
  },
  {
    id: 'asset-003',
    tenantId: 'tenant-a',
    name: 'Monitoring gateway',
    assetType: { id: 'generic.gateway', version: 1 },
  },
];

/**
 * Deterministic keyset fixture behind the same read port as a future HTTP
 * adapter. It returns through the wire parser, exercising the trust boundary
 * instead of bypassing it with a type cast.
 *
 * Fixtures use ASCII IDs. Their code-unit ordering is not a general model of
 * PostgreSQL's locale-dependent ordering for arbitrary Unicode identifiers.
 */
export function createFixtureAssetReader(
  records: readonly AssetSummary[] = PREVIEW_ASSETS,
): AssetCatalogueReader {
  const snapshot = records.map((asset) => ({
    id: asset.id,
    tenantId: asset.tenantId,
    name: asset.name,
    assetType: { ...asset.assetType },
  }));
  snapshot.sort((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
  );

  return {
    async listPage(request: AssetPageRequest, options?: AssetReadOptions) {
      options?.signal?.throwIfAborted();
      validateAssetPageRequest(request);
      const matching = snapshot.filter(
        (asset) =>
          asset.tenantId === request.tenantId &&
          (request.after === undefined || asset.id > request.after),
      );
      const assets = matching.slice(0, request.limit);
      const nextAfter =
        matching.length > request.limit ? (assets.at(-1)?.id ?? null) : null;

      options?.signal?.throwIfAborted();
      return parseAssetPage(
        {
          assets: assets.map((asset) => ({
            id: asset.id,
            tenant_id: asset.tenantId,
            name: asset.name,
            asset_type: {
              id: asset.assetType.id,
              version: asset.assetType.version,
            },
          })),
          next_after: nextAfter,
        },
        request,
      );
    },
  };
}
