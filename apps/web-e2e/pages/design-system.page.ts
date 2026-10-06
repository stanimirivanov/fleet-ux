import type { Locator, Page } from '@playwright/test';
import {
  documentResult,
  type GuideNarrator,
} from '../user-guide/guide-narrator';

/** Reference specimens for status semantics under both color themes. */
export class DesignSystemPage {
  readonly heading: Locator;
  readonly lightSample: Locator;
  readonly darkSample: Locator;

  constructor(
    page: Page,
    private readonly narrator?: GuideNarrator,
  ) {
    this.heading = page.getByRole('heading', {
      level: 1,
      name: 'Design system',
    });
    this.lightSample = page.locator('article[data-theme="light"]');
    this.darkSample = page.locator('article[data-theme="dark"]');
  }

  async document(): Promise<void> {
    await documentResult(this.narrator, this.heading, {
      title: 'Read condition, connection, and freshness separately',
      body: 'The side-by-side light and dark specimens distinguish asset condition, gateway connection, telemetry freshness, and alert severity.',
    });
  }
}
