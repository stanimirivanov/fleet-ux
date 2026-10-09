import { describe, expect, test } from 'vitest';
import contract from '../../../../../../contracts/http/fleetiq-v1-ui-baseline.openapi.json';
import type { AssetPageRequest } from '../model/asset-catalogue';
import { AssetPageContractError, parseAssetPage } from './parse-asset-page';

const request: AssetPageRequest = { tenantId: 'tenant-a', limit: 50 };
const contractExample =
  contract.components.responses['listAssets-200'].content['application/json']
    .example;
const exampleAsset = contractExample.assets[0];
if (!exampleAsset)
  throw new Error('Pinned contract example must contain an asset');

describe('asset page contract boundary', () => {
  test('accepts the backend-owned example and projects only trusted fields', () => {
    expect(
      parseAssetPage(
        {
          ...contractExample,
          future_page_field: 'ignored',
          assets: [
            {
              ...exampleAsset,
              future_asset_field: 'ignored',
              asset_type: {
                ...exampleAsset.asset_type,
                future_type_field: 'ignored',
              },
            },
          ],
        },
        request,
      ),
    ).toEqual({
      assets: [
        {
          id: 'asset-1',
          tenantId: 'tenant-a',
          name: 'Primary machine',
          assetType: { id: 'generic.machine', version: 1 },
        },
      ],
      nextAfter: null,
    });
  });

  test.each([
    { assets: [{}], next_after: null },
    { assets: [], next_after: 42 },
    {
      assets: [
        {
          id: 'asset-1',
          tenant_id: 'tenant-a',
          name: 'Primary machine',
          asset_type: { id: 'generic.machine', version: 0 },
        },
      ],
      next_after: null,
    },
  ])('rejects a malformed wire document', (wire) => {
    expect(() => parseAssetPage(wire, request)).toThrow(AssetPageContractError);
  });

  test('rejects a different tenant even when the wire shape is valid', () => {
    const wire = {
      ...contractExample,
      assets: [{ ...exampleAsset, tenant_id: 'tenant-b' }],
    };
    expect(() => parseAssetPage(wire, request)).toThrow(AssetPageContractError);
  });

  test('rejects a page that exceeds the requested limit or repeats an ID', () => {
    const first = exampleAsset;
    expect(() =>
      parseAssetPage(
        { assets: [first, { ...first, id: 'asset-2' }], next_after: null },
        { ...request, limit: 1 },
      ),
    ).toThrow(AssetPageContractError);
    expect(() =>
      parseAssetPage(
        { assets: [first, first], next_after: null },
        { ...request, limit: 2 },
      ),
    ).toThrow(AssetPageContractError);
  });

  test('rejects a non-advancing cursor or cursor on an empty page', () => {
    expect(() =>
      parseAssetPage(
        { assets: [exampleAsset], next_after: 'asset-1' },
        { ...request, after: 'asset-1' },
      ),
    ).toThrow(AssetPageContractError);
    expect(() =>
      parseAssetPage({ assets: [], next_after: 'asset-2' }, request),
    ).toThrow(AssetPageContractError);
  });

  test('validates request bounds before interpreting a page', () => {
    expect(() =>
      parseAssetPage(contractExample, { ...request, limit: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      parseAssetPage(contractExample, { ...request, after: ' ' }),
    ).toThrow(RangeError);
  });
});
test('retains redacted decoder paths without retaining input values', () => {
  const privateValue = 'secret-sensor-value-987';
  let failure: unknown;
  try {
    parseAssetPage(
      {
        assets: [
          {
            ...exampleAsset,
            name: { unexpected_private_key: privateValue },
          },
        ],
        next_after: null,
      },
      request,
    );
  } catch (cause) {
    failure = cause;
  }

  expect(failure).toBeInstanceOf(AssetPageContractError);
  if (!(failure instanceof AssetPageContractError)) return;
  expect(failure.paths).toContain('$.assets[0].name');
  expect(JSON.stringify(failure.paths)).not.toContain(privateValue);
  expect(JSON.stringify(failure.paths)).not.toContain('unexpected_private_key');
});
