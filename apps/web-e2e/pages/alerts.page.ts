import type { Locator, Page } from '@playwright/test';

/** Semantic locators and operator actions for the alert triage workspace. */
export class AlertsPage {
  readonly heading: Locator;
  readonly connectionNotice: Locator;
  readonly summary: Locator;
  readonly queue: Locator;
  readonly alertList: Locator;
  readonly selectedEvidence: Locator;
  readonly trend: Locator;
  readonly timeline: Locator;
  readonly search: Locator;
  readonly severity: Locator;
  readonly reviewState: Locator;
  readonly readingsDisclosure: Locator;
  readonly evidenceShortcut: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', {
      level: 1,
      name: 'Alerts & evidence',
    });
    this.connectionNotice = page.getByRole('region', {
      name: 'Alerts are not connected',
    });
    this.summary = page.getByRole('region', {
      name: 'Sample alert summary',
    });
    this.queue = page.getByRole('region', {
      name: /^Alert queue \(\d+\)$/u,
    });
    this.alertList = page.getByRole('list', {
      name: 'Filtered sample alerts',
    });
    this.selectedEvidence = page.getByRole('region', {
      name: 'Selected alert evidence',
    });
    this.trend = page.getByRole('region', {
      name: 'Evidence trend',
    });
    this.timeline = page.getByRole('region', {
      name: 'Event timeline',
    });
    this.search = this.queue.getByRole('searchbox', {
      name: 'Search alerts',
    });
    this.severity = this.queue.getByRole('combobox', {
      name: 'Severity',
    });
    this.reviewState = this.queue.getByRole('combobox', {
      name: 'Review state',
    });
    this.evidenceShortcut = this.alertList.getByRole('link', {
      name: 'View selected evidence',
    });
    this.readingsDisclosure = this.trend.getByText('View readings as a table', {
      exact: true,
    });
  }

  async openSample(search = ''): Promise<void> {
    await this.page.goto(`/alerts?preview=sample${search}`);
    await this.heading.waitFor({ state: 'visible' });
    // The development-only workspace is loaded through a lazy chunk.
    await this.queue.waitFor({ state: 'visible', timeout: 20_000 });
  }

  alert(title: string, asset: string): Locator {
    return this.alertList.getByRole('button', {
      name: `Inspect ${title} on ${asset}`,
      exact: true,
    });
  }

  async select(title: string, asset: string): Promise<void> {
    await this.alert(title, asset).click();
  }

  async showReadingsTable(): Promise<void> {
    await this.readingsDisclosure.click();
  }
}
