import type { Locator, Page } from '@playwright/test';
import {
  documentResult,
  type GuideNarrator,
} from '../user-guide/guide-narrator';

/** Asset catalogue content and its current connection state. */
export class AssetsPage {
  readonly heading: Locator;
  readonly connectionNotice: Locator;
  readonly samplePreview: Locator;
  readonly viewSampleLink: Locator;
  readonly exitSampleLink: Locator;
  readonly firstPageLink: Locator;
  readonly nextPageLink: Locator;
  readonly invalidCursorAlert: Locator;

  constructor(
    page: Page,
    private readonly narrator?: GuideNarrator,
  ) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Assets' });
    this.connectionNotice = page.getByRole('region', {
      name: 'Sign-in unavailable',
    });
    this.samplePreview = page.getByRole('region', {
      name: 'Sample asset catalogue',
    });
    this.viewSampleLink = page.getByRole('link', {
      name: 'View sample catalogue',
    });
    this.exitSampleLink = page.getByRole('link', { name: 'Exit sample' });
    this.firstPageLink = page.getByRole('link', { name: 'First page' });
    this.nextPageLink = page.getByRole('link', { name: 'Next page' });
    this.invalidCursorAlert = page.getByRole('alert').filter({
      hasText: 'Invalid sample cursor',
    });
  }

  async document(): Promise<void> {
    await documentResult(this.narrator, this.connectionNotice, {
      title: 'Understand the asset catalogue state',
      body: 'Browser sign-in is unavailable on this deployment, so protected asset records cannot be opened. This does not mean the fleet is empty.',
    });
  }
}
