import { describe, expect, test } from 'vitest';
import { getDemoMapWorkbench } from '../demo/map-fixture';
import {
  filterMapAssets,
  parseMapWorkbenchSearch,
  resolveSelectedMapAsset,
} from './map-workbench';

describe('sample map URL and selection', () => {
  const assets = getDemoMapWorkbench('tenant-a').assets;

  test('parses shareable facets and rejects invalid or ambiguous enum values', () => {
    expect(
      parseMapWorkbenchSearch(
        '?preview=sample&q=locomotive&type=rail.electric-locomotive&condition=nominal&connectivity=connected&site=Central+depot&position=recent&asset=asset-004',
      ),
    ).toEqual({
      q: 'locomotive',
      type: 'rail.electric-locomotive',
      condition: 'nominal',
      connectivity: 'connected',
      site: 'Central depot',
      position: 'recent',
      selectedAssetId: 'asset-004',
    });
    expect(
      parseMapWorkbenchSearch(
        '?condition=broken&position=stale&connectivity=connected&connectivity=disconnected&asset=asset-004&asset=asset-005',
      ),
    ).toMatchObject({
      condition: '',
      connectivity: '',
      position: '',
      selectedAssetId: null,
    });
  });

  test('distinguishes absent selection from malformed explicit selection', () => {
    expect(parseMapWorkbenchSearch('').selectedAssetId).toBe('');
    expect(parseMapWorkbenchSearch('?asset=').selectedAssetId).toBeNull();
    expect(parseMapWorkbenchSearch('?asset=%20bad').selectedAssetId).toBeNull();
    expect(
      parseMapWorkbenchSearch('?asset=asset-004&asset=asset-005')
        .selectedAssetId,
    ).toBeNull();
    expect(resolveSelectedMapAsset(assets, null)).toBeNull();
  });
  test('combines equipment-neutral search with condition, site, and position', () => {
    const filters = parseMapWorkbenchSearch(
      '?q=locomotive&condition=critical&site=East+branch&position=recent',
    );
    expect(
      filterMapAssets(assets, filters).map(({ asset }) => asset.id),
    ).toEqual(['asset-005']);
    expect(
      filterMapAssets(
        assets,
        parseMapWorkbenchSearch('?position=unavailable'),
      ).map(({ asset }) => asset.id),
    ).toEqual(['asset-008']);
    expect(
      filterMapAssets(
        assets,
        parseMapWorkbenchSearch(
          '?type=rail.electric-locomotive&connectivity=disconnected',
        ),
      ),
    ).toEqual([]);
  });

  test('defaults to a positioned visible asset but never substitutes for an explicit bad ID', () => {
    const all = filterMapAssets(assets, parseMapWorkbenchSearch(''));
    expect(resolveSelectedMapAsset(all, '')?.asset.id).toBe('asset-001');
    expect(resolveSelectedMapAsset(all, 'asset-008')?.asset.id).toBe(
      'asset-008',
    );
    expect(resolveSelectedMapAsset(all, 'missing')).toBeNull();

    const unavailableOnly = filterMapAssets(
      assets,
      parseMapWorkbenchSearch('?position=unavailable'),
    );
    expect(resolveSelectedMapAsset(unavailableOnly, '')).toBeNull();
    expect(resolveSelectedMapAsset(unavailableOnly, 'asset-004')).toBeNull();
  });
});
