import { expect, test } from '@playwright/test';
import { AssetsPage } from '../pages/assets.page';
import { OverviewPage } from '../pages/overview.page';
import { ShellPage } from '../pages/shell.page';

test.use({ viewport: { width: 390, height: 844 } });

test('narrow navigation remains usable without horizontal overflow', async ({
  page,
}) => {
  const shell = new ShellPage(page);
  const overview = new OverviewPage(page);
  const assets = new AssetsPage(page);

  await shell.open();
  await expect(overview.heading).toBeVisible();
  await expect(shell.primaryNavigation).toBeVisible();
  await expect(shell.themeButton).toBeVisible();

  await shell.goToAssets();
  await expect(assets.heading).toBeVisible();
  await expect(shell.main).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
