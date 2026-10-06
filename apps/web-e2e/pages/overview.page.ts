import type { Locator, Page } from '@playwright/test';
import {
  documentResult,
  type GuideNarrator,
} from '../user-guide/guide-narrator';

/** Overview content, separate from the persistent application shell. */
export class OverviewPage {
  readonly heading: Locator;
  readonly connectionNotice: Locator;

  constructor(
    page: Page,
    private readonly narrator?: GuideNarrator,
  ) {
    this.heading = page.getByRole('heading', {
      level: 1,
      name: 'Fleet overview',
    });
    this.connectionNotice = page.getByRole('region', {
      name: 'Fleet data is not connected yet',
    });
  }

  async document(): Promise<void> {
    await documentResult(this.narrator, this.connectionNotice, {
      title: 'Know when fleet evidence is unavailable',
      body: 'The overview identifies its unconfigured data source instead of inventing asset counts, locations, or alerts.',
    });
  }
}
