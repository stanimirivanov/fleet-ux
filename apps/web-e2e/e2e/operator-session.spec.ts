import { installMetadataApi } from '../fixtures/metadata-api';
import { expect, test } from '../fixtures/production-test';
import { ConnectedMetadataPage } from '../pages/connected-metadata.page';
import { OperatorSessionPage } from '../pages/operator-session.page';

test('signed-out metadata offers native navigation to the fixed sign-in endpoint', async ({
  page,
  identityDestination,
}) => {
  const api = await installMetadataApi(page, {
    sessionStatus: 401,
    identityDestination,
  });
  const session = new OperatorSessionPage(page);
  await page.goto('/assets?tenant=tenant-a');
  await expect(session.signedOut).toBeVisible();
  await expect(session.signIn).toHaveAttribute('href', '/api/v1/auth/login');
  await session.signIn.click();
  await expect(page).toHaveURL(identityDestination);
  expect(
    api.requests.some(
      (request) =>
        request.path === '/api/v1/auth/login' && request.method === 'GET',
    ),
  ).toBe(true);
  await expect(
    page.getByRole('heading', { name: 'Test sign-in destination' }),
  ).toBeVisible();
  expect(
    api.requests.filter((request) =>
      request.path.startsWith('/api/v1/tenants/'),
    ),
  ).toHaveLength(0);
  expect(
    api.requests.every((request) => request.authorization === undefined),
  ).toBe(true);
});

test('an expired metadata session clears protected evidence and asks for sign-in', async ({
  page,
}) => {
  const api = await installMetadataApi(page);
  const metadata = new ConnectedMetadataPage(page);
  const session = new OperatorSessionPage(page);
  await metadata.openCatalogue();
  await expect(metadata.catalogue).toBeVisible();
  api.setCatalogueStatus(401);
  await metadata.nextCataloguePage();
  await expect(session.signedOut).toBeVisible();
  await expect(metadata.catalogue).toHaveCount(0);
  await expect(page.getByText('Primary machine', { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole('banner')).toContainText('Sign-in required');
});

test('failed logout hides protected evidence until the server confirms a retry', async ({
  page,
}) => {
  const api = await installMetadataApi(page, { logoutStatus: 500 });
  const metadata = new ConnectedMetadataPage(page);
  const session = new OperatorSessionPage(page);
  await metadata.openCatalogue();
  await expect(metadata.catalogue).toBeVisible();
  await session.logOut();
  await expect(
    page.getByRole('alert', { name: 'Sign-out not confirmed' }),
  ).toBeVisible();
  await expect(metadata.catalogue).toHaveCount(0);
  await expect(session.signedOut).toHaveCount(0);
  await expect(page.getByRole('banner')).toContainText(
    'Sign-out not confirmed',
  );
  api.setLogoutStatus(204);
  await page
    .getByRole('button', { name: 'Retry sign-out', exact: true })
    .click();
  await expect(session.signedOut).toBeVisible();
  expect(
    api.requests.filter((request) => request.path === '/api/v1/auth/logout'),
  ).toHaveLength(2);
});

test('a successful sign-in return restores only the saved internal metadata route', async ({
  page,
  identityDestination,
}) => {
  const api = await installMetadataApi(page, {
    sessionStatus: 401,
    identityDestination,
  });
  const session = new OperatorSessionPage(page);
  await page.goto('/assets?tenant=tenant-a&after=assembly-a');
  await expect(session.signedOut).toBeVisible();
  await session.signIn.click();
  await expect(page).toHaveURL(identityDestination);
  expect(
    api.requests.some(
      (request) =>
        request.path === '/api/v1/auth/login' && request.method === 'GET',
    ),
  ).toBe(true);
  api.setSessionStatus(200);
  // Model the server's fixed callback redirect without exposing provider tokens.
  await page.goto('/');
  const metadata = new ConnectedMetadataPage(page);
  await expect(page).toHaveURL(/\/assets\?tenant=tenant-a&after=assembly-a/u);
  await expect(metadata.asset('Power system')).toBeVisible();
});

test('an operator switch remounts protected views and reads metadata again', async ({
  page,
}) => {
  const api = await installMetadataApi(page);
  const metadata = new ConnectedMetadataPage(page);
  const session = new OperatorSessionPage(page);
  await metadata.openCatalogue();
  await expect(metadata.catalogue).toBeVisible();
  const previousList = await metadata.catalogue.elementHandle();
  expect(previousList).not.toBeNull();
  const originalReads = api.requests.filter((request) =>
    request.path.endsWith('/assets'),
  ).length;
  await session.openAccount();
  await expect(session.actor('operator-a')).toBeVisible();
  await session.account.click();

  api.setActorId('operator-b');
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect
    .poll(
      () =>
        api.requests.filter((request) => request.path.endsWith('/assets'))
          .length,
    )
    .toBeGreaterThan(originalReads);
  await expect(metadata.catalogue).toBeVisible();
  expect(await previousList?.evaluate((element) => element.isConnected)).toBe(
    false,
  );
  await session.openAccount();
  await expect(session.actor('operator-b')).toBeVisible();
  await expect(session.actor('operator-a')).toHaveCount(0);
  await session.account.click();
  await expect(metadata.asset('Primary machine')).toBeVisible();
});
