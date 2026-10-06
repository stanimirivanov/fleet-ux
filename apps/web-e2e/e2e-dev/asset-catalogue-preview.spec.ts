import { expect, test } from '@playwright/test';
import { AssetsPage } from '../pages/assets.page';
import { ShellPage } from '../pages/shell.page';

test('sample catalogue is an explicit development-only journey', async ({
  page,
}) => {
  const shell = new ShellPage(page);
  const assets = new AssetsPage(page);

  await shell.open('/assets');
  await expect(assets.heading).toBeVisible();
  await expect(assets.connectionNotice).toBeVisible();
  await expect(assets.samplePreview).toHaveCount(0);

  await assets.viewSampleLink.click();
  await expect(page).toHaveURL('/assets?preview=sample');
  await expect(assets.samplePreview).toBeVisible();
  await expect(page.getByRole('banner')).toContainText(
    'Sample data · development',
  );
  await expect(assets.samplePreview.getByText('Sample data')).toBeVisible();
  for (const name of [
    'Primary machine',
    'Power system',
    'Monitoring gateway',
  ]) {
    await expect(assets.samplePreview.getByText(name)).toBeVisible();
  }
  await expect(assets.connectionNotice).toHaveCount(0);
  await expect(shell.main).toBeFocused();

  await assets.exitSampleLink.click();
  await expect(page).toHaveURL('/assets');
  await expect(assets.connectionNotice).toBeVisible();
  await expect(assets.samplePreview).toHaveCount(0);
  await expect(shell.main).toBeFocused();

  await page.goBack();
  await expect(page).toHaveURL('/assets?preview=sample');
  await expect(assets.samplePreview).toBeVisible();
  await expect(shell.main).toBeFocused();
  await page.goForward();
  await expect(assets.connectionNotice).toBeVisible();
  await expect(page.getByRole('banner')).toContainText(
    'Data source unconfigured',
  );
});

test('direct sample preview remains usable at a narrow width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const assets = new AssetsPage(page);

  await page.goto('/assets?preview=sample');
  await expect(assets.heading).toBeVisible();
  await expect(assets.samplePreview).toBeVisible();
  await expect(assets.exitSampleLink).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
