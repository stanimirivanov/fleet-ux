import { expect, test } from '../fixtures/production-test';
import { AssetsPage } from '../pages/assets.page';
import { DesignSystemPage } from '../pages/design-system.page';
import { OverviewPage } from '../pages/overview.page';
import { ShellPage } from '../pages/shell.page';

test('navigation preserves the shell, focus, title, and browser history', async ({
  page,
}) => {
  const shell = new ShellPage(page);
  const overview = new OverviewPage(page);
  const assets = new AssetsPage(page);
  const designSystem = new DesignSystemPage(page);

  await shell.open();
  await expect(overview.heading).toBeVisible();
  await expect(shell.overviewLink).toHaveAttribute('aria-current', 'page');
  const originalBanner = await page.getByRole('banner').elementHandle();
  expect(originalBanner).not.toBeNull();

  await shell.goToAssets();
  await expect(page).toHaveURL(/\/assets$/);
  await expect(page).toHaveTitle('Assets · FleetIQ');
  await expect(assets.heading).toBeVisible();
  await expect(shell.assetsLink).toHaveAttribute('aria-current', 'page');
  await expect(shell.main).toBeFocused();
  expect(
    await originalBanner?.evaluate(
      (element) => element === document.querySelector('header'),
    ),
  ).toBe(true);

  await shell.goToDesignSystem();
  await expect(designSystem.heading).toBeVisible();
  await expect(page).toHaveTitle('Design system · FleetIQ');
  await expect(shell.main).toBeFocused();

  await page.goBack();
  await expect(assets.heading).toBeVisible();
  await expect(page).toHaveTitle('Assets · FleetIQ');
  await expect(shell.main).toBeFocused();

  await shell.goToOverview();
  await expect(overview.heading).toBeVisible();
  await expect(page).toHaveURL('/');
});

test('direct links and unknown routes retain a useful frame', async ({
  page,
}) => {
  const shell = new ShellPage(page);
  const assets = new AssetsPage(page);

  await shell.open('/assets');
  await expect(assets.heading).toBeVisible();
  await expect(assets.connectionNotice).toBeVisible();

  await shell.open('/unavailable-workspace');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Page not found' }),
  ).toBeVisible();
  await expect(page).toHaveTitle('Page not found · FleetIQ');
  await expect(shell.primaryNavigation).toBeVisible();
});
