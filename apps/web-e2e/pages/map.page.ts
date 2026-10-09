import type { Locator, Page } from '@playwright/test';
import {
  documentResult,
  type GuideNarrator,
  performDocumentedAction,
} from '../user-guide/guide-narrator';

/** Stable map-workbench locators and documented sample interactions. */
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

  constructor(
    private readonly page: Page,
    private readonly narrator?: GuideNarrator,
  ) {
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
    // The development server can transform this route on first navigation.
    await this.assetList.waitFor({ state: 'visible', timeout: 20_000 });
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

  async searchFor(value: string): Promise<void> {
    await performDocumentedAction(
      this.narrator,
      this.searchAssets,
      {
        title: 'Find a sample asset',
        body: 'Search the synthetic asset list by name, ID, type, or site. The map and list use the same URL-backed filter.',
      },
      () => this.searchAssets.fill(value),
    );
  }

  async clearSearch(): Promise<void> {
    await this.searchAssets.fill('');
  }

  async choosePositionEvidence(value: string): Promise<void> {
    await performDocumentedAction(
      this.narrator,
      this.positionFilter,
      {
        title: 'Filter by position evidence',
        body: 'Filter the synthetic snapshot to assets with unavailable positions. An absent marker is evidence of missing location, not an absent asset.',
      },
      async () => {
        await this.positionFilter.selectOption(value);
      },
    );
  }

  async selectFromList(name: string): Promise<void> {
    const target = this.listAsset(name);
    await performDocumentedAction(
      this.narrator,
      target,
      {
        title: `Select ${name} from the list`,
        body: 'Choose a synthetic asset by its identity. The list, map marker when present, and selected-evidence panel follow the same selection.',
      },
      () => target.click(),
    );
  }

  async selectMarker(name: string): Promise<void> {
    const target = this.marker(name);
    await performDocumentedAction(
      this.narrator,
      target,
      {
        title: `Select ${name} on the schematic map`,
        body: 'The synthetic map marker selects the same asset as the list. These canvas coordinates are illustrative, not geographic.',
      },
      () => target.click(),
    );
  }

  async showTable(): Promise<void> {
    await performDocumentedAction(
      this.narrator,
      this.tableButton,
      {
        title: 'Review the sample assets as a table',
        body: 'The table keeps every synthetic asset reachable, including assets with no position marker.',
      },
      () => this.tableButton.click(),
    );
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

  async documentList(): Promise<void> {
    await documentResult(this.narrator, this.assetList, {
      title: 'The list preserves asset access',
      body: 'This is a synthetic sample snapshot. Each asset remains selectable from the list even when its position is unavailable.',
    });
  }

  async documentCanvas(): Promise<void> {
    await documentResult(this.narrator, this.siteMap, {
      title: 'Read the schematic canvas',
      body: 'The synthetic site layout is not to scale and is not a live basemap. Markers appear only where the sample has position evidence.',
    });
  }

  async documentSelectedEvidence(): Promise<void> {
    await documentResult(this.narrator, this.selectedAsset, {
      title: 'Assess selected position evidence',
      body: 'The selected synthetic asset shows position state, observed and received times, source, and quality; missing position is stated explicitly.',
    });
  }
}
