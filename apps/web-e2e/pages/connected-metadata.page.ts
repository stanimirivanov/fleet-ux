import type { Locator, Page } from '@playwright/test';

/** Operator actions on connected metadata; scenarios own contract/policy assertions. */
export class ConnectedMetadataPage {
  readonly tenantId: Locator;
  readonly openTenant: Locator;
  readonly catalogue: Locator;
  readonly filter: Locator;
  readonly typeFilter: Locator;
  readonly cataloguePages: Locator;
  readonly identity: Locator;
  readonly pinnedType: Locator;
  readonly relationships: Locator;
  readonly targetBindings: Locator;
  readonly sourceBindings: Locator;
  readonly registryMappingLink: Locator;
  readonly effectiveAt: Locator;
  readonly knownAt: Locator;
  readonly applyTimes: Locator;

  constructor(private readonly page: Page) {
    this.tenantId = page.getByLabel('Tenant ID', { exact: true });
    this.openTenant = page.getByRole('button', {
      name: 'Open tenant',
      exact: true,
    });
    this.catalogue = page.getByRole('list', {
      name: 'Connected assets',
      exact: true,
    });
    this.filter = page.getByRole('searchbox', {
      name: 'Filter assets',
      exact: true,
    });
    this.typeFilter = page.getByRole('combobox', {
      name: 'Asset type',
      exact: true,
    });
    this.cataloguePages = page.getByRole('navigation', {
      name: 'Asset catalogue pages',
      exact: true,
    });
    this.identity = page.getByRole('region', {
      name: 'Asset identity',
      exact: true,
    });
    this.pinnedType = page.getByRole('region', {
      name: 'Pinned asset type',
      exact: true,
    });
    this.relationships = page.getByRole('region', {
      name: 'Directed relationships',
      exact: true,
    });
    this.targetBindings = page.getByRole('region', {
      name: 'Target signal bindings',
      exact: true,
    });
    this.sourceBindings = page.getByRole('region', {
      name: 'Source binding candidates',
      exact: true,
    });
    this.registryMappingLink = page.getByRole('link', {
      name: 'Review registry mapping',
      exact: true,
    });
    this.effectiveAt = page.getByLabel('Effective at (Unix ms)', {
      exact: true,
    });
    this.knownAt = page.getByLabel('Known at (Unix ms)', { exact: true });
    this.applyTimes = page.getByRole('button', {
      name: 'Apply review times',
      exact: true,
    });
  }

  async openCatalogue(search = ''): Promise<void> {
    await this.page.goto(`/assets?tenant=tenant-a${search}`);
  }

  async openRegistry(search = ''): Promise<void> {
    await this.page.goto(
      `/assets/registry/review?tenant=tenant-a&after=assembly-a&asset=power-system-1&effective_at_ms=1500&known_at_ms=2500${search}`,
    );
  }

  asset(name: string): Locator {
    return this.catalogue.getByRole('link', {
      name: `Inspect ${name}`,
      exact: true,
    });
  }

  async showPropertyDefinition(id: string, version: number): Promise<void> {
    await this.pinnedType
      .getByText(`Property ${id} v${version}`, { exact: true })
      .click();
  }

  async inspect(name: string): Promise<void> {
    await this.asset(name).click();
  }
  async selectRegistryAsset(name: string): Promise<void> {
    await this.page
      .getByRole('button', { name: `Select ${name}`, exact: true })
      .click();
  }
  async nextCataloguePage(): Promise<void> {
    await this.cataloguePages
      .getByRole('link', { name: 'Next page', exact: true })
      .click();
  }
  async reviewSource(signal: string): Promise<void> {
    await this.page
      .getByRole('button', { name: `Review source ${signal}`, exact: true })
      .click();
  }
  paging(kind: 'Relationship' | 'Target binding' | 'Source binding'): Locator {
    return this.page.getByRole('navigation', {
      name: `${kind} pages`,
      exact: true,
    });
  }
  async nextSnapshotPage(
    kind: 'relationship' | 'target binding' | 'source binding',
  ): Promise<void> {
    await this.page
      .getByRole('link', { name: `Next ${kind} page`, exact: true })
      .click();
  }
  async applyReviewTimes(effective: string, known: string): Promise<void> {
    await this.effectiveAt.fill(effective);
    await this.knownAt.fill(known);
    await this.applyTimes.click();
  }
}
