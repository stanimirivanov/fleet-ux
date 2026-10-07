import { isValidAssetIdentifier } from './asset-catalogue';

/**
 * URL-backed sample map filters. This model has no Solid or fixture imports:
 * future validated live rows can use the same selection and filtering rules.
 */
export type MapCondition = 'nominal' | 'attention' | 'critical' | 'unknown';
export type MapConnectivity = 'connected' | 'disconnected' | 'unknown';
export type MapPositionState = 'recent' | 'last-known' | 'unavailable';

export interface MapWorkbenchFilters {
  readonly q: string;
  readonly type: string;
  readonly condition: MapCondition | '';
  readonly connectivity: MapConnectivity | '';
  readonly site: string;
  readonly position: MapPositionState | '';
  /** Empty means no request; null means an explicit malformed request. */
  readonly selectedAssetId: string | null;
}

export interface MapFilterAsset {
  readonly asset: {
    readonly id: string;
    readonly name: string;
    readonly assetType: { readonly id: string };
  };
  readonly operations: {
    readonly condition: MapCondition;
    readonly connectivity: MapConnectivity;
  };
  readonly location: {
    readonly state: MapPositionState;
    readonly position: {
      readonly xPercent: number;
      readonly yPercent: number;
    } | null;
    readonly siteLabel: string;
  };
}

const CONDITIONS: readonly MapCondition[] = [
  'nominal',
  'attention',
  'critical',
  'unknown',
];
const CONNECTIONS: readonly MapConnectivity[] = [
  'connected',
  'disconnected',
  'unknown',
];
const POSITIONS: readonly MapPositionState[] = [
  'recent',
  'last-known',
  'unavailable',
];

function singleValue(parameters: URLSearchParams, key: string): string {
  const values = parameters.getAll(key);
  return values.length === 1 ? (values[0] ?? '') : '';
}

function requestedAssetId(parameters: URLSearchParams): string | null {
  const values = parameters.getAll('asset');
  if (values.length === 0) return '';
  const selected = values[0];
  if (values.length !== 1 || !selected || !isValidAssetIdentifier(selected)) {
    return null;
  }
  return selected;
}

function allowedValue<T extends string>(
  value: string,
  allowed: readonly T[],
): T | '' {
  return allowed.find((candidate) => candidate === value) ?? '';
}

/** Invalid facets fall back to all; malformed explicit asset IDs stay invalid. */
export function parseMapWorkbenchSearch(search: string): MapWorkbenchFilters {
  const parameters = new URLSearchParams(search);
  return {
    q: singleValue(parameters, 'q'),
    type: singleValue(parameters, 'type'),
    condition: allowedValue(singleValue(parameters, 'condition'), CONDITIONS),
    connectivity: allowedValue(
      singleValue(parameters, 'connectivity'),
      CONNECTIONS,
    ),
    site: singleValue(parameters, 'site'),
    position: allowedValue(singleValue(parameters, 'position'), POSITIONS),
    selectedAssetId: requestedAssetId(parameters),
  };
}

/** Filters the complete authorized/fixture set; never infer a fleet total. */
export function filterMapAssets<T extends MapFilterAsset>(
  assets: readonly T[],
  filters: MapWorkbenchFilters,
): readonly T[] {
  const query = filters.q.trim().toLowerCase();
  return assets.filter((row) => {
    const searchable = [
      row.asset.name,
      row.asset.id,
      row.asset.assetType.id,
      row.location.siteLabel,
    ]
      .join(' ')
      .toLowerCase();
    return (
      (!query || searchable.includes(query)) &&
      (!filters.type || row.asset.assetType.id === filters.type) &&
      (!filters.condition || row.operations.condition === filters.condition) &&
      (!filters.connectivity ||
        row.operations.connectivity === filters.connectivity) &&
      (!filters.site || row.location.siteLabel === filters.site) &&
      (!filters.position || row.location.state === filters.position)
    );
  });
}

/**
 * A selected ID only resolves in the filtered set. Without an explicit ID,
 * prefer the first positioned asset so the contextual panel starts useful.
 * An explicit malformed, unknown, or filtered-out ID remains unresolved.
 */
export function resolveSelectedMapAsset<T extends MapFilterAsset>(
  filteredAssets: readonly T[],
  selectedAssetId: string | null,
): T | null {
  if (selectedAssetId === null) return null;
  if (selectedAssetId) {
    return (
      filteredAssets.find((row) => row.asset.id === selectedAssetId) ?? null
    );
  }
  return filteredAssets.find((row) => row.location.position !== null) ?? null;
}
