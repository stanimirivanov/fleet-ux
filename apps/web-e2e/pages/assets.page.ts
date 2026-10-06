import type { Locator, Page } from '@playwright/test';
import {
  documentResult,
  type GuideNarrator,
} from '../user-guide/guide-narrator';

/** Asset catalogue content and its current connection state. */
export class AssetsPage {
  readonly heading: Locator;
  readonly connectionNotice: Locator;

  constructor(
    page: Page,
    private readonly narrator?: GuideNarrator,
  ) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Assets' });
    this.connectionNotice = page.getByRole('region', {
      name: 'The asset catalogue is awaiting its API contract',
    });
  }

  async document(): Promise<void> {
    await documentResult(this.narrator, this.connectionNotice, {
      title: 'Understand the asset catalogue state',
      body: 'No asset rows are shown until a tenant-scoped read model is connected. This does not mean the fleet is empty.',
    });
  }
}
