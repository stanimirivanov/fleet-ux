import { createFixtureAssetReader } from '../api/fixture-asset-reader';
import { AssetCatalogueView } from './AssetCatalogueView';

const reader = createFixtureAssetReader();

/** Dev-only adapter composition, loaded only after an explicit preview choice. */
export default function DevelopmentAssetCatalogue() {
  return <AssetCatalogueView reader={reader} tenantId="tenant-a" />;
}
