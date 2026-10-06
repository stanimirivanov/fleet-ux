import { createFixtureAssetReader } from '../api/fixture-asset-reader';
import { AssetCatalogueView } from './AssetCatalogueView';

const reader = createFixtureAssetReader();

/** Dev-only adapter composition, loaded only after an explicit preview choice. */
export default function DevelopmentAssetCatalogue(props: {
  readonly after?: string;
  readonly pageHref: (after?: string) => string;
}) {
  return (
    <AssetCatalogueView
      reader={reader}
      tenantId="tenant-a"
      after={props.after}
      limit={2}
      pageHref={props.pageHref}
    />
  );
}
