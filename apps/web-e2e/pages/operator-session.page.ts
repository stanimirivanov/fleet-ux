import type { Locator, Page } from '@playwright/test';

/** Same-origin sign-in and account actions; provider token exchange stays server-side. */
export class OperatorSessionPage {
  readonly unavailable: Locator;
  readonly signedOut: Locator;
  readonly account: Locator;
  readonly signIn: Locator;
  readonly signOut: Locator;

  constructor(private readonly page: Page) {
    this.unavailable = page.getByRole('region', {
      name: 'Sign-in unavailable',
      exact: true,
    });
    this.signedOut = page.getByRole('region', {
      name: 'Sign in to FleetIQ',
      exact: true,
    });
    this.account = page.getByRole('button', {
      name: 'Operator account',
      exact: true,
    });
    this.signIn = page.getByRole('link', { name: 'Sign in', exact: true });
    this.signOut = page.getByRole('button', { name: 'Sign out', exact: true });
  }

  async openAccount(): Promise<void> {
    await this.account.click();
  }
  async logOut(): Promise<void> {
    await this.openAccount();
    await this.signOut.click();
  }
  actor(id: string): Locator {
    return this.page.getByText(id, { exact: true });
  }
}
