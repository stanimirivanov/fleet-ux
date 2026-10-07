import { expect, test } from 'vitest';
import {
  assetInspectorSampleHref,
  assetSamplePreviewHref,
  isAssetInspectorSamplePreview,
  isAssetSamplePreview,
  isMapSamplePreview,
  isRegistrySamplePreview,
  readAssetPreviewCursor,
  registrySampleHref,
} from './asset-preview-url';

test('sample preview activation is scoped to the asset route', () => {
  expect(isAssetSamplePreview('/assets', '?preview=sample')).toBe(true);
  expect(isAssetSamplePreview('/assets', '?preview=other')).toBe(false);
  expect(isAssetSamplePreview('/', '?preview=sample')).toBe(false);
});

test('map preview activation requires the exact map path and opt-in', () => {
  expect(isMapSamplePreview('/map', '?preview=sample')).toBe(true);
  expect(isMapSamplePreview('/map', '?preview=other')).toBe(false);
  expect(isMapSamplePreview('/assets', '?preview=sample')).toBe(false);
  expect(isMapSamplePreview('/map/asset-001', '?preview=sample')).toBe(false);
});

test('cursor parsing preserves first and forward pages but rejects ambiguity', () => {
  expect(readAssetPreviewCursor('?preview=sample')).toEqual({ kind: 'first' });
  expect(readAssetPreviewCursor('?preview=sample&after=asset-002')).toEqual({
    kind: 'page',
    after: 'asset-002',
  });
  expect(readAssetPreviewCursor('?after=%20')).toEqual({ kind: 'invalid' });
  expect(readAssetPreviewCursor('?after=a&after=b')).toEqual({
    kind: 'invalid',
  });
});

test('preview URLs retain the explicit opt-in and encode the cursor', () => {
  expect(assetSamplePreviewHref()).toBe('/assets?preview=sample');
  expect(assetSamplePreviewHref('asset 2')).toBe(
    '/assets?preview=sample&after=asset+2',
  );
});

test('inspector preview is restricted to an asset detail path and encodes IDs', () => {
  expect(
    isAssetInspectorSamplePreview('/assets/asset-001', '?preview=sample'),
  ).toBe(true);
  expect(isAssetInspectorSamplePreview('/assets', '?preview=sample')).toBe(
    false,
  );
  expect(
    isAssetInspectorSamplePreview(
      '/assets/asset-001/events',
      '?preview=sample',
    ),
  ).toBe(false);
  expect(
    isAssetInspectorSamplePreview('/assets/asset-001', '?preview=other'),
  ).toBe(false);
  expect(assetInspectorSampleHref('asset 1')).toBe(
    '/assets/asset%201?preview=sample',
  );
});

test('registry preview requires the exact route and one opt-in', () => {
  expect(
    isRegistrySamplePreview('/assets/registry/review', '?preview=sample'),
  ).toBe(true);
  expect(
    isRegistrySamplePreview(
      '/assets/registry/review',
      '?preview=sample&preview=sample',
    ),
  ).toBe(false);
  expect(
    isRegistrySamplePreview('/assets/registry/review', '?preview=other'),
  ).toBe(false);
  expect(isRegistrySamplePreview('/assets/asset-004', '?preview=sample')).toBe(
    false,
  );
});

test('registry sample links encode asset selection', () => {
  expect(registrySampleHref()).toBe('/assets/registry/review?preview=sample');
  expect(registrySampleHref('asset 004')).toBe(
    '/assets/registry/review?preview=sample&asset=asset+004',
  );
});
