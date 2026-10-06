/** User-facing copy injected into the reusable catalogue presentation. */
export interface AssetCatalogueCopy {
  readonly loading: string;
  readonly errorTitle: string;
  readonly invalidRequest: string;
  readonly invalidResponse: string;
  readonly unavailable: string;
  readonly firstEmpty: string;
  readonly laterEmpty: string;
  readonly afterNotice: string;
  readonly listTitle: string;
  readonly listLabel: string;
  readonly moreWithoutNavigation: string;
}

export const defaultAssetCatalogueCopy: AssetCatalogueCopy = {
  loading: 'Loading catalogue entries…',
  errorTitle: 'Asset catalogue could not be loaded',
  invalidRequest: 'The catalogue request is invalid.',
  invalidResponse: 'The catalogue returned an invalid response.',
  unavailable: 'The catalogue is unavailable. Try again.',
  firstEmpty: 'No assets exist in this catalogue page.',
  laterEmpty: 'No further assets follow this cursor.',
  afterNotice: 'Showing entries after the selected cursor.',
  listTitle: 'Catalogue entries',
  listLabel: 'Assets',
  moreWithoutNavigation: 'Additional entries exist beyond this page.',
};
