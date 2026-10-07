import { expect, test } from 'vitest';
import {
  assetInspectorSampleHref,
  assetSamplePreviewHref,
  isAssetInspectorSamplePreview,
  isAssetSamplePreview,
  readAssetPreviewCursor,
} from './asset-preview-url';

test('sample preview activation is scoped to the asset route', () => {
  expect(isAssetSamplePreview('/assets', '?preview=sample')).toBe(true);
  expect(isAssetSamplePreview('/assets', '?preview=other')).toBe(false);
  expect(isAssetSamplePreview('/', '?preview=sample')).toBe(false);
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
