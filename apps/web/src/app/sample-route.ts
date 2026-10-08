import { isAlertsSamplePreview } from '#features/alerts';
import {
  isAssetInspectorSamplePreview,
  isAssetSamplePreview,
  isMapSamplePreview,
  isRegistrySamplePreview,
} from '#features/assets';
import { APP_ROUTES } from './route-metadata';

/** App-shell source status follows the exact development sample routes. */
export function isDevelopmentSampleRoute(
  pathname: string,
  search: string,
  development: boolean,
): boolean {
  return (
    development &&
    (pathname === APP_ROUTES.overview.path ||
      isAssetSamplePreview(pathname, search) ||
      isAssetInspectorSamplePreview(pathname, search) ||
      isMapSamplePreview(pathname, search) ||
      isRegistrySamplePreview(pathname, search) ||
      isAlertsSamplePreview(pathname, search))
  );
}

/** Primary navigation opts into available previews only in development. */
export function navigationHref(pathname: string, development: boolean): string {
  if (
    development &&
    (pathname === APP_ROUTES.assets.path ||
      pathname === APP_ROUTES.map.path ||
      pathname === APP_ROUTES.alerts.path)
  ) {
    return `${pathname}?preview=sample`;
  }
  return pathname;
}
