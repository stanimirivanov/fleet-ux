import { isValidAssetIdentifier } from './asset-catalogue';

/** Explicit development preview route state, kept independent of Solid Router. */
export function isAssetSamplePreview(
  pathname: string,
  search: string,
): boolean {
  return (
    pathname === '/assets' &&
    new URLSearchParams(search).get('preview') === 'sample'
  );
}

export type AssetPreviewCursor =
  | { readonly kind: 'first' }
  | { readonly kind: 'page'; readonly after: string }
  | { readonly kind: 'invalid' };

/** Rejects duplicate or malformed cursors before a reader invocation. */
export function readAssetPreviewCursor(search: string): AssetPreviewCursor {
  const values = new URLSearchParams(search).getAll('after');
  if (values.length === 0) return { kind: 'first' };
  const after = values[0];
  if (values.length !== 1 || !after || !isValidAssetIdentifier(after)) {
    return { kind: 'invalid' };
  }
  return { kind: 'page', after };
}

/** Constructs the shareable first or forward page URL. */
export function assetSamplePreviewHref(after?: string): string {
  const params = new URLSearchParams({ preview: 'sample' });
  if (after !== undefined) params.set('after', after);
  return `/assets?${params.toString()}`;
}
