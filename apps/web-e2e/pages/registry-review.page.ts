import type { Locator, Page } from '@playwright/test';

/** Stable locators and operator actions for the read-only registry preview. */
export class RegistryReviewPage {
  readonly heading: Locator;
  readonly connectionNotice: Locator;
  readonly catalogue: Locator;
  readonly structure: Locator;
  readonly mapping: Locator;
  readonly provenance: Locator;
  readonly unresolved: Locator;
  readonly searchAssets: Locator;
  readonly typeFilter: Locator;
  readonly effectiveAt: Locator;
  readonly knownAt: Locator;
  readonly applyTimes: Locator;
  readonly resetTimes: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', {
      level: 1,
      name: 'Asset registry & signal mapping',
    });
    this.connectionNotice = page.getByRole('region', {
      name: 'Sign-in unavailable',
    });
    this.catalogue = page.getByRole('region', { name: 'Asset catalogue' });
    this.structure = page.getByRole('region', { name: 'Asset structure' });
    this.mapping = page.getByRole('region', { name: 'Signal mapping' });
    this.provenance = page.getByRole('region', { name: 'Source provenance' });
    this.unresolved = page.getByRole('region', {
      name: 'Unassigned and ambiguous signals',
    });
    this.searchAssets = this.catalogue.getByRole('searchbox', {
      name: 'Find an asset',
    });
    this.typeFilter = this.catalogue.getByRole('combobox', {
      name: 'Asset type',
    });
    this.effectiveAt = page.getByLabel('Effective at (UTC)');
    this.knownAt = page.getByLabel('Known at (UTC)');
    this.applyTimes = page.getByRole('button', {
      name: 'Apply review times',
    });
    this.resetTimes = page.getByRole('button', {
      name: 'Reset review times',
    });
  }

  async openSample(search = ''): Promise<void> {
    await this.page.goto(`/assets/registry/review?preview=sample${search}`);
    await this.catalogue.waitFor({ state: 'visible' });
  }

  asset(name: string): Locator {
    return this.catalogue.getByRole('button', { name, exact: true });
  }

  node(name: string): Locator {
    return this.structure.getByRole('button', { name, exact: true });
  }

  source(name: string): Locator {
    return this.mapping.getByRole('button', {
      name: `Review source ${name}`,
      exact: true,
    });
  }

  async selectAsset(name: string): Promise<void> {
    await this.asset(name).click();
  }

  async selectNode(name: string): Promise<void> {
    await this.node(name).click();
  }

  async selectSource(name: string): Promise<void> {
    await this.source(name).click();
  }

  async applyReviewTimes(effectiveAt: string, knownAt: string): Promise<void> {
    await this.effectiveAt.fill(effectiveAt);
    await this.knownAt.fill(knownAt);
    await this.applyTimes.click();
  }
}
