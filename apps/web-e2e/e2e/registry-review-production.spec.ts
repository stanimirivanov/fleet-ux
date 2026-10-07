import { expect, test } from '@playwright/test';
import { RegistryReviewPage } from '../pages/registry-review.page';
import { ShellPage } from '../pages/shell.page';

test('production registry cannot activate sample graph or binding evidence', async ({
  page,
}) => {
  const shell = new ShellPage(page);
  const registry = new RegistryReviewPage(page);

  for (const path of [
    '/assets/registry/review',
    '/assets/registry/review?preview=sample&asset=asset-004&source=can.aux.current&effective_at_ms=1791280800000&known_at_ms=1791280800000',
  ]) {
    await shell.open(path);
    await expect(registry.heading).toBeVisible();
    await expect(registry.connectionNotice).toBeVisible();
    await expect(page.getByRole('banner')).toContainText(
      'Data source unconfigured',
    );
    for (const panel of [
      registry.catalogue,
      registry.structure,
      registry.mapping,
      registry.provenance,
      registry.unresolved,
    ]) {
      await expect(panel).toHaveCount(0);
    }
    for (const synthetic of [
      'Sample data',
      'Electric locomotive 417',
      'Refrigerated trailer 11',
      'can.unknown.027',
      'can.aux.current',
      'sample-binding-motor-temperature',
    ]) {
      await expect(page.getByText(synthetic, { exact: true })).toHaveCount(0);
    }
  }
});
