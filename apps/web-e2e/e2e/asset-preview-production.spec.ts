import { expect, test } from '@playwright/test';
import { AssetsPage } from '../pages/assets.page';
import { ShellPage } from '../pages/shell.page';

test('sample preview query never exposes synthetic assets in production', async ({
  page,
}) => {
  const shell = new ShellPage(page);
  const assets = new AssetsPage(page);

  await shell.open('/assets?preview=sample');
  await expect(assets.heading).toBeVisible();
  await expect(assets.connectionNotice).toBeVisible();
  await expect(page.getByRole('banner')).toContainText(
    'Data source unconfigured',
  );
  await expect(assets.samplePreview).toHaveCount(0);
  await expect(assets.viewSampleLink).toHaveCount(0);
  for (const name of [
    'Sample data',
    'Primary machine',
    'Power system',
    'Monitoring gateway',
  ]) {
    await expect(page.getByText(name)).toHaveCount(0);
  }
});
