import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { createSignal } from 'solid-js';
import { afterEach, expect, test } from 'vitest';
import type {
  AssetCatalogueReader,
  AssetPage,
  AssetPageRequest,
} from '../model/asset-catalogue';
import { AssetCatalogueView } from './AssetCatalogueView';

const firstPage: AssetPage = {
  assets: [
    {
      id: 'asset-001',
      tenantId: 'tenant-a',
      name: 'Primary machine',
      assetType: { id: 'generic.machine', version: 2 },
    },
  ],
  nextAfter: 'asset-001',
};

function deferredPage() {
  let complete: ((page: AssetPage) => void) | undefined;
  const promise = new Promise<AssetPage>((resolve) => {
    complete = resolve;
  });
  return {
    promise,
    resolve(page: AssetPage) {
      if (!complete) throw new Error('Page promise was not initialized');
      complete(page);
    },
  };
}

afterEach(cleanup);

test('shows loading until the injected reader returns a bounded tenant page', async () => {
  const pending = deferredPage();
  const requests: AssetPageRequest[] = [];
  const reader: AssetCatalogueReader = {
    listPage(request) {
      requests.push(request);
      return pending.promise;
    },
  };

  render(() => <AssetCatalogueView reader={reader} tenantId="tenant-a" />);

  expect(screen.getByRole('status').textContent).toContain(
    'Loading catalogue entries',
  );
  expect(requests).toEqual([{ tenantId: 'tenant-a', limit: 50 }]);

  pending.resolve(firstPage);

  const list = await screen.findByRole('list', { name: 'Sample assets' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(1);
  expect(within(list).getByText('Primary machine')).toBeTruthy();
  expect(within(list).getByText('asset-001')).toBeTruthy();
  expect(within(list).getByText('generic.machine')).toBeTruthy();
  expect(within(list).getByText('2')).toBeTruthy();
  expect(
    screen.getByText('Additional entries exist beyond this first sample page.'),
  ).toBeTruthy();
  expect(screen.queryByText('Loading catalogue entries…')).toBeNull();
});

test('explains that an empty sample page does not establish connected fleet state', async () => {
  const reader: AssetCatalogueReader = {
    async listPage() {
      return { assets: [], nextAfter: null };
    },
  };

  render(() => <AssetCatalogueView reader={reader} tenantId="tenant-a" />);

  await screen.findByText(/No assets exist in this sample catalogue page/);
  const status = screen.getByRole('status');
  expect(status.textContent).toContain(
    'This says nothing about a connected fleet.',
  );
  expect(screen.queryByRole('list', { name: 'Sample assets' })).toBeNull();
});

test('offers retry after reader rejection and renders the recovered page', async () => {
  const requests: AssetPageRequest[] = [];
  const reader: AssetCatalogueReader = {
    async listPage(request) {
      requests.push(request);
      if (requests.length === 1) throw new Error('Simulated reader failure');
      return { ...firstPage, nextAfter: null };
    },
  };
  const user = userEvent.setup();

  render(() => <AssetCatalogueView reader={reader} tenantId="tenant-a" />);

  const alert = await screen.findByRole('alert');
  expect(alert.textContent).toContain('Asset catalogue could not be loaded');
  expect(screen.queryByRole('list', { name: 'Sample assets' })).toBeNull();

  await user.click(screen.getByRole('button', { name: 'Retry loading' }));

  expect(
    await screen.findByRole('list', { name: 'Sample assets' }),
  ).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(requests).toEqual([
    { tenantId: 'tenant-a', limit: 50 },
    { tenantId: 'tenant-a', limit: 50 },
  ]);
  expect(
    screen.queryByText(
      'Additional entries exist beyond this first sample page.',
    ),
  ).toBeNull();
});

test('ignores a previous tenant response after the selected tenant changes', async () => {
  const first = deferredPage();
  const second = deferredPage();
  const requests: AssetPageRequest[] = [];
  const reader: AssetCatalogueReader = {
    listPage(request) {
      requests.push(request);
      return request.tenantId === 'tenant-a' ? first.promise : second.promise;
    },
  };
  const [tenantId, setTenantId] = createSignal('tenant-a');

  render(() => <AssetCatalogueView reader={reader} tenantId={tenantId()} />);
  setTenantId('tenant-b');
  await waitFor(() => {
    expect(requests).toHaveLength(2);
  });

  first.resolve(firstPage);
  await first.promise;
  expect(screen.getByRole('status').textContent).toContain(
    'Loading catalogue entries',
  );
  expect(screen.queryByText('Primary machine')).toBeNull();

  second.resolve({
    assets: [
      {
        id: 'asset-002',
        tenantId: 'tenant-b',
        name: 'Second machine',
        assetType: { id: 'generic.machine', version: 1 },
      },
    ],
    nextAfter: null,
  });
  expect(await screen.findByText('Second machine')).toBeTruthy();
  expect(screen.queryByText('Primary machine')).toBeNull();
  expect(requests).toEqual([
    { tenantId: 'tenant-a', limit: 50 },
    { tenantId: 'tenant-b', limit: 50 },
  ]);
});
