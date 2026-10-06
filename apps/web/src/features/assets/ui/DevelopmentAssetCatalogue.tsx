import { createFixtureAssetReader } from '../api/fixture-asset-reader';
import { AssetCatalogueView } from './AssetCatalogueView';
import {
  type AssetCatalogueCopy,
  defaultAssetCatalogueCopy,
} from './asset-catalogue-copy';

const reader = createFixtureAssetReader();

const sampleCatalogueCopy: AssetCatalogueCopy = {
  ...defaultAssetCatalogueCopy,
  unavailable: 'The sample reader failed. No assets have been shown.',
  invalidResponse: 'The sample reader returned an invalid catalogue page.',
  firstEmpty:
    'No assets exist in this sample catalogue page. This says nothing about a connected fleet.',
  laterEmpty:
    'No further sample assets follow this cursor. This says nothing about a connected fleet.',
  afterNotice: 'Showing entries after the selected sample cursor.',
  listLabel: 'Sample assets',
  moreWithoutNavigation:
    'Additional entries exist beyond this first sample page.',
};

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
      copy={sampleCatalogueCopy}
    />
  );
}
