import type { Locator, Page } from '@playwright/test';
import {
  documentResult,
  type GuideNarrator,
  performDocumentedAction,
} from '../user-guide/guide-narrator';

/** Shared application frame. Its locators remain valid across route changes. */
export class ShellPage {
  readonly main: Locator;
  readonly primaryNavigation: Locator;
  readonly overviewLink: Locator;
  readonly assetsLink: Locator;
  readonly designSystemLink: Locator;
  readonly skipLink: Locator;
  readonly themeButton: Locator;

  constructor(
    private readonly page: Page,
    private readonly narrator?: GuideNarrator,
  ) {
    this.main = page.getByRole('main');
    this.primaryNavigation = page.getByRole('navigation', {
      name: 'Primary navigation',
    });
    this.overviewLink = this.primaryNavigation.getByRole('link', {
      name: 'Overview',
      exact: true,
    });
    this.assetsLink = this.primaryNavigation.getByRole('link', {
      name: 'Assets',
      exact: true,
    });
    this.designSystemLink = this.primaryNavigation.getByRole('link', {
      name: 'Design system',
      exact: true,
    });
    this.skipLink = page.getByRole('link', { name: 'Skip to main content' });
    this.themeButton = page.getByRole('button', { name: /^Theme:/ });
  }

  async open(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async goToOverview(): Promise<void> {
    await performDocumentedAction(
      this.narrator,
      this.overviewLink,
      {
        title: 'Open the fleet overview',
        body: 'Choose Overview to return to the fleet workspace.',
      },
      async () => {
        await this.overviewLink.click();
        await this.page
          .getByRole('heading', { level: 1, name: 'Fleet overview' })
          .waitFor();
      },
    );
  }

  async goToAssets(): Promise<void> {
    await performDocumentedAction(
      this.narrator,
      this.assetsLink,
      {
        title: 'Open the asset catalogue',
        body: 'Choose Assets from the primary navigation.',
      },
      async () => {
        await this.assetsLink.click();
        await this.page
          .getByRole('heading', { level: 1, name: 'Assets' })
          .waitFor();
      },
    );
  }

  async goToDesignSystem(): Promise<void> {
    await performDocumentedAction(
      this.narrator,
      this.designSystemLink,
      {
        title: 'Open the design system',
        body: 'Choose Design system to inspect the operational status examples.',
      },
      async () => {
        await this.designSystemLink.click();
        await this.page
          .getByRole('heading', { level: 1, name: 'Design system' })
          .waitFor();
      },
    );
  }

  async cycleTheme(): Promise<void> {
    const currentLabel = await this.themeButton.getAttribute('aria-label');
    const nextTheme =
      /Switch to (light|dark|system)\./.exec(currentLabel ?? '')?.[1] ??
      'the next';

    const displayTheme = `${nextTheme[0]?.toUpperCase()}${nextTheme.slice(1)}`;

    await performDocumentedAction(
      this.narrator,
      this.themeButton,
      {
        title: `Switch to ${displayTheme} theme`,
        body: 'Use the single theme button to cycle through Light, Dark, and System.',
      },
      () => this.themeButton.click(),
    );
    await documentResult(this.narrator, this.themeButton, {
      title: `${displayTheme} theme preference`,
      body: 'The chosen preference applies to every workspace and is saved for the next visit.',
    });
  }
}
