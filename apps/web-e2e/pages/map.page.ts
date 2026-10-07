import type { Locator, Page } from '@playwright/test';

/** Stable map-workbench locators for sample and unconfigured production states. */
export class MapPage {
  readonly heading: Locator;
  readonly connectionNotice: Locator;
  readonly assetList: Locator;
  readonly siteMap: Locator;
  readonly selectedAsset: Locator;
  readonly searchAssets: Locator;
  readonly typeFilter: Locator;
  readonly siteFilter: Locator;
  readonly conditionFilter: Locator;
  readonly connectionFilter: Locator;
  readonly positionFilter: Locator;
  readonly tableButton: Locator;
  readonly listButton: Locator;
  readonly narrowMapButton: Locator;
  readonly narrowListButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Fleet map' });
    this.connectionNotice = page.getByRole('region', {
      name: 'Fleet locations are not connected',
    });
    this.assetList = page.getByRole('region', { name: 'Asset list' });
    this.siteMap = page.getByRole('region', {
      name: 'Illustrative site map',
    });
    this.selectedAsset = page.getByRole('region', { name: 'Selected asset' });
    this.searchAssets = this.assetList.getByRole('searchbox', {
      name: 'Search assets',
    });
    this.typeFilter = this.assetList.getByRole('combobox', {
      name: 'Asset type',
    });
    this.siteFilter = this.assetList.getByRole('combobox', { name: 'Site' });
    this.conditionFilter = this.assetList.getByRole('combobox', {
      name: 'Condition',
    });
    this.connectionFilter = this.assetList.getByRole('combobox', {
      name: 'Device connection',
    });
    this.positionFilter = this.assetList.getByRole('combobox', {
      name: 'Position evidence',
    });
    this.tableButton = this.assetList.getByRole('button', {
      name: 'Table',
      exact: true,
    });
    this.listButton = this.assetList.getByRole('button', {
      name: 'List',
      exact: true,
    });
    this.narrowMapButton = page.getByRole('button', {
      name: 'Map view',
      exact: true,
    });
    this.narrowListButton = page.getByRole('button', {
      name: 'Asset list',
      exact: true,
    });
  }

  async openSample(search = ''): Promise<void> {
    await this.page.goto(`/map?preview=sample${search}`);
  }

  listAsset(name: string): Locator {
    return this.assetList.getByRole('button', {
      name: `Select ${name}`,
      exact: true,
    });
  }

  marker(name: string): Locator {
    return this.siteMap.getByRole('button', {
      name: new RegExp(`^Select ${name};`),
    });
  }

  async selectFromList(name: string): Promise<void> {
    await this.listAsset(name).click();
  }

  async selectMarker(name: string): Promise<void> {
    await this.marker(name).click();
  }

  async showTable(): Promise<void> {
    await this.tableButton.click();
  }

  async showList(): Promise<void> {
    await this.listButton.click();
  }

  async showMapAtNarrowWidth(): Promise<void> {
    await this.narrowMapButton.click();
  }

  async showListAtNarrowWidth(): Promise<void> {
    await this.narrowListButton.click();
  }
}
