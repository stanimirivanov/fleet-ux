import { describe, expect, test } from 'vitest';
import type { AssetSummary } from '../model/asset-catalogue';
import { createFixtureAssetReader } from './fixture-asset-reader';

const records: readonly AssetSummary[] = [
  {
    id: 'asset-003',
    tenantId: 'tenant-a',
    name: 'Third machine',
    assetType: { id: 'generic.machine', version: 1 },
  },
  {
    id: 'asset-001',
    tenantId: 'tenant-b',
    name: 'Other tenant machine',
    assetType: { id: 'generic.machine', version: 1 },
  },
  {
    id: 'asset-002',
    tenantId: 'tenant-a',
    name: 'Second machine',
    assetType: { id: 'generic.machine', version: 1 },
  },
  {
    id: 'asset-001',
    tenantId: 'tenant-a',
    name: 'First machine',
    assetType: { id: 'generic.machine', version: 1 },
  },
];

describe('explicit fixture asset reader', () => {
  test('traverses ordered tenant-scoped pages with an exclusive cursor', async () => {
    const reader = createFixtureAssetReader(records);

    const first = await reader.listPage({ tenantId: 'tenant-a', limit: 2 });
    expect(first.assets.map((asset) => asset.id)).toEqual([
      'asset-001',
      'asset-002',
    ]);
    expect(first.assets.map((asset) => asset.tenantId)).toEqual([
      'tenant-a',
      'tenant-a',
    ]);
    expect(first.nextAfter).toBe('asset-002');

    const second = await reader.listPage({
      tenantId: 'tenant-a',
      limit: 2,
      after: first.nextAfter ?? undefined,
    });
    expect(second.assets.map((asset) => asset.id)).toEqual(['asset-003']);
    expect(second.nextAfter).toBeNull();

    const exhausted = await reader.listPage({
      tenantId: 'tenant-a',
      limit: 2,
      after: 'asset-003',
    });
    expect(exhausted).toEqual({ assets: [], nextAfter: null });
  });

  test('returns only the selected tenant and snapshots supplied fixtures', async () => {
    const mutable = records.map((asset) => ({
      ...asset,
      assetType: { ...asset.assetType },
    }));
    const reader = createFixtureAssetReader(mutable);
    const firstMutable = mutable[0];
    if (!firstMutable) throw new Error('Fixture setup requires a record');
    firstMutable.name = 'Changed after construction';

    const page = await reader.listPage({ tenantId: 'tenant-b', limit: 10 });
    expect(page.assets.map((asset) => asset.name)).toEqual([
      'Other tenant machine',
    ]);
    const tenantA = await reader.listPage({ tenantId: 'tenant-a', limit: 10 });
    expect(tenantA.assets.at(-1)?.name).toBe('Third machine');
  });

  test('rejects malformed page requests', async () => {
    const reader = createFixtureAssetReader(records);
    await expect(
      reader.listPage({ tenantId: 'tenant-a', limit: 101 }),
    ).rejects.toThrow(RangeError);
    await expect(
      reader.listPage({ tenantId: ' tenant-a', limit: 1 }),
    ).rejects.toThrow(RangeError);
  });
});
