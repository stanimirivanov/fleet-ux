import { installMetadataApi } from '../fixtures/metadata-api';
import { expect, test } from '../fixtures/production-test';
import { captureWorkspaceEvidence } from '../fixtures/workspace-evidence';
import { ConnectedMetadataPage } from '../pages/connected-metadata.page';
import { OperatorSessionPage } from '../pages/operator-session.page';

test('operator reviews bounded identities, pinned definitions and temporal mappings, then signs out', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1680, height: 940 });
  const api = await installMetadataApi(page);
  const metadata = new ConnectedMetadataPage(page);
  const session = new OperatorSessionPage(page);
  await metadata.openCatalogue();

  await expect(metadata.catalogue).toBeVisible();
  await expect(page.getByRole('banner')).toContainText('Operator connected');
  await session.openAccount();
  await expect(session.actor('operator-a')).toBeVisible();
  await session.account.click();
  await captureWorkspaceEvidence(page, testInfo, 'connected-catalogue-light');

  await metadata.filter.fill('Primary');
  await expect(page).toHaveURL(/q=Primary/u);
  await expect(metadata.asset('Primary machine')).toBeVisible();
  await expect(metadata.asset('Main assembly')).toHaveCount(0);
  await metadata.filter.fill('');
  await metadata.typeFilter.selectOption('generic.machine');
  await expect(page).toHaveURL(/type=generic.machine/u);
  await metadata.inspect('Primary machine');
  await expect(page).toHaveURL(/\/assets\/asset-1\?/u);
  await expect(metadata.identity).toContainText('SN-100');
  await expect(metadata.pinnedType).toContainText('generic.machine');
  await metadata.showPropertyDefinition('thermal.temperature', 1);
  await expect(metadata.pinnedType).toContainText('Air temperature');
  await expect(page.getByText('Sample data', { exact: true })).toHaveCount(0);
  await expect(
    page.getByText('Electric locomotive 417', { exact: true }),
  ).toHaveCount(0);

  await page.goBack();
  await expect(metadata.catalogue).toBeVisible();
  await expect(metadata.typeFilter).toHaveValue('generic.machine');
  await metadata.typeFilter.selectOption('');
  await metadata.nextCataloguePage();
  await expect(page).toHaveURL(/after=assembly-a/u);
  await expect(metadata.asset('Power system')).toBeVisible();
  await expect(metadata.asset('Primary machine')).toHaveCount(0);
  await page.reload();
  await expect(metadata.asset('Power system')).toBeVisible();
  await metadata.inspect('Power system');
  await expect(metadata.identity).toContainText('power-system-1');
  await expect(metadata.pinnedType).toContainText('generic.power-system');
  await metadata.showPropertyDefinition('electrical.voltage', 3);
  await expect(metadata.pinnedType).toContainText('Supply voltage');
  await captureWorkspaceEvidence(page, testInfo, 'connected-inspector-light');

  await metadata.registryMappingLink.click();
  await expect(page).toHaveURL(/\/assets\/registry\/review/u);
  await metadata.applyReviewTimes('1500', '2500');
  await expect(page).toHaveURL(/effective_at_ms=1500/u);
  await expect(page).toHaveURL(/known_at_ms=2500/u);
  await expect(metadata.relationships).toContainText('power-system-1');
  await expect(metadata.relationships).toContainText('component-b');
  await expect(metadata.relationships).toContainText('physical.contains');
  await expect(metadata.targetBindings).toContainText('binding-1');
  await metadata.reviewSource('bus.voltage');
  await expect(page).toHaveURL(/device_asset_id=gateway-1/u);
  await expect(page).toHaveURL(/endpoint_id=can-primary/u);
  await expect(page).toHaveURL(/signal_id=bus.voltage/u);
  await expect(metadata.sourceBindings).toContainText('binding-1');
  await expect(metadata.sourceBindings).toContainText('electrical.voltage');
  await captureWorkspaceEvidence(page, testInfo, 'connected-registry-light');
  await page.reload();
  await expect(metadata.sourceBindings).toContainText('binding-1');

  await metadata.nextSnapshotPage('relationship');
  await expect(page).toHaveURL(/relationship_after=relationship-1/u);
  await expect(metadata.relationships).toContainText('relationship-2');
  await expect(metadata.targetBindings).toContainText('binding-1');
  await metadata.nextSnapshotPage('target binding');
  await expect(page).toHaveURL(/target_after=binding-1/u);
  await expect(metadata.targetBindings).toContainText('binding-2');
  await metadata.nextSnapshotPage('source binding');
  await expect(page).toHaveURL(/source_after=binding-1/u);
  await expect(metadata.sourceBindings).toContainText('binding-2');
  await page.goBack();
  await expect(page).not.toHaveURL(/source_after=/u);
  await expect(metadata.sourceBindings).toContainText('binding-1');

  await metadata.applyReviewTimes('3000', '3500');
  await expect(page).toHaveURL(/effective_at_ms=3000/u);
  await expect(page).not.toHaveURL(
    /relationship_after=|target_after=|source_after=/u,
  );
  await expect(metadata.relationships).not.toContainText('relationship-1');
  await expect(metadata.targetBindings).not.toContainText('binding-1');

  await session.logOut();
  await expect(session.signedOut).toBeVisible();
  await expect(metadata.identity).toHaveCount(0);
  await expect(metadata.sourceBindings).toHaveCount(0);
  const logout = api.requests.find(
    (request) => request.path === '/api/v1/auth/logout',
  );
  expect(logout?.method).toBe('POST');
  expect(logout?.csrf).toBe('1');
  expect(logout?.origin).toBe(new URL(page.url()).origin);
  expect(
    api.requests.every((request) => request.authorization === undefined),
  ).toBe(true);
  const catalogueReads = api.requests.filter((request) =>
    request.path.endsWith('/assets'),
  );
  expect(
    catalogueReads.every((request) => {
      const query = new URLSearchParams(request.search);
      return !query.has('q') && !query.has('type');
    }),
  ).toBe(true);
  const reviewedSnapshots = api.requests.filter((request) => {
    const query = new URLSearchParams(request.search);
    return (
      /relationships|signal-bindings/u.test(request.path) &&
      query.get('effective_at_ms') === '1500'
    );
  });
  expect(reviewedSnapshots.length).toBeGreaterThan(0);
  expect(
    reviewedSnapshots.every((request) => {
      const query = new URLSearchParams(request.search);
      return query.get('known_at_ms') === '2500' && query.get('limit') === '50';
    }),
  ).toBe(true);
});

test('connected registry remains usable on a narrow dark workspace', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installMetadataApi(page);
  const metadata = new ConnectedMetadataPage(page);
  await metadata.openRegistry();
  await expect(metadata.targetBindings).toContainText('binding-1');
  await page.getByRole('button', { name: /^Theme:/u }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await metadata.reviewSource('bus.voltage');
  await expect(metadata.sourceBindings).toContainText('gateway-1');
  await captureWorkspaceEvidence(
    page,
    testInfo,
    'connected-registry-narrow-dark',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
