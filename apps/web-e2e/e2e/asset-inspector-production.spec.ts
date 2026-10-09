import { expect, test } from '../fixtures/production-test';
import { AssetInspectorPage } from '../pages/asset-inspector.page';
import { ShellPage } from '../pages/shell.page';

test('production inspector cannot expose sample topology or readings', async ({
  page,
}) => {
  const shell = new ShellPage(page);
  const inspector = new AssetInspectorPage(page);

  for (const path of [
    '/assets/asset-004?preview=sample&component=sample-motor-417',
    '/assets/asset-008?preview=sample&component=sample-freezer-011',
  ]) {
    await shell.open(path);
    await expect(inspector.heading).toHaveText('Asset inspector');
    await expect(inspector.connectionNotice).toBeVisible();
    await expect(page.getByRole('banner')).toContainText('Sign-in unavailable');
    await expect(inspector.topology).toHaveCount(0);
    await expect(inspector.componentEvidence).toHaveCount(0);
    await expect(inspector.context).toHaveCount(0);
    await expect(inspector.playback).toHaveCount(0);
    for (const synthetic of [
      'Sample data',
      'Electric locomotive 417',
      'Refrigerated trailer 11',
      'Motor temperature',
      'Battery bus voltage',
      'Refrigeration unit',
    ]) {
      await expect(page.getByText(synthetic, { exact: true })).toHaveCount(0);
    }
  }
});
