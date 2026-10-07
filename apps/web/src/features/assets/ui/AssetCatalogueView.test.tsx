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
import {
  AssetPageContractError,
  AssetPageRequestError,
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

  const list = await screen.findByRole('list', { name: 'Assets' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(1);
  expect(within(list).getByText('Primary machine')).toBeTruthy();
  expect(within(list).getByText('asset-001')).toBeTruthy();
  expect(within(list).getByText('generic.machine')).toBeTruthy();
  expect(within(list).getByText('v2')).toBeTruthy();
  expect(
    screen.getByText('Additional entries exist beyond this page.'),
  ).toBeTruthy();
  expect(screen.queryByText('Loading catalogue entries…')).toBeNull();
});

test('renders the generic empty catalogue state', async () => {
  const reader: AssetCatalogueReader = {
    async listPage() {
      return { assets: [], nextAfter: null };
    },
  };

  render(() => <AssetCatalogueView reader={reader} tenantId="tenant-a" />);

  await screen.findByText(/No assets exist in this catalogue page/);
  const status = screen.getByRole('status');
  expect(status.textContent).toContain(
    'No assets exist in this catalogue page.',
  );
  expect(screen.queryByRole('list', { name: 'Assets' })).toBeNull();
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
  expect(screen.queryByRole('list', { name: 'Assets' })).toBeNull();

  await user.click(screen.getByRole('button', { name: 'Retry loading' }));

  expect(await screen.findByRole('list', { name: 'Assets' })).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(requests).toEqual([
    { tenantId: 'tenant-a', limit: 50 },
    { tenantId: 'tenant-a', limit: 50 },
  ]);
  expect(
    screen.queryByText('Additional entries exist beyond this page.'),
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

test('ignores a previous page response after the URL cursor changes', async () => {
  const first = deferredPage();
  const second = deferredPage();
  const requests: AssetPageRequest[] = [];
  const reader: AssetCatalogueReader = {
    listPage(request) {
      requests.push(request);
      return request.after === undefined ? first.promise : second.promise;
    },
  };
  const [after, setAfter] = createSignal<string | undefined>(undefined);

  render(() => (
    <AssetCatalogueView
      reader={reader}
      tenantId="tenant-a"
      after={after()}
      limit={2}
    />
  ));
  setAfter('asset-002');
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
        id: 'asset-003',
        tenantId: 'tenant-a',
        name: 'Monitoring gateway',
        assetType: { id: 'generic.gateway', version: 1 },
      },
    ],
    nextAfter: null,
  });
  expect(await screen.findByText('Monitoring gateway')).toBeTruthy();
  expect(screen.queryByText('Primary machine')).toBeNull();
  expect(requests).toEqual([
    { tenantId: 'tenant-a', limit: 2 },
    { tenantId: 'tenant-a', limit: 2, after: 'asset-002' },
  ]);
});

test('aborts superseded reads and the active read on unmount', async () => {
  const signals: AbortSignal[] = [];
  const reader: AssetCatalogueReader = {
    listPage(_request, options) {
      if (!options?.signal) throw new Error('Missing read signal');
      signals.push(options.signal);
      return new Promise<AssetPage>(() => {});
    },
  };
  const [after, setAfter] = createSignal<string | undefined>();
  const view = render(() => (
    <AssetCatalogueView reader={reader} tenantId="tenant-a" after={after()} />
  ));

  expect(signals).toHaveLength(1);
  setAfter('asset-002');
  await waitFor(() => expect(signals).toHaveLength(2));
  expect(signals[0]?.aborted).toBe(true);
  expect(signals[1]?.aborted).toBe(false);

  view.unmount();
  expect(signals[1]?.aborted).toBe(true);
});

test('shows a safe, typed fallback for an invalid adapter response', async () => {
  const reader: AssetCatalogueReader = {
    async listPage() {
      throw new AssetPageContractError('Sensitive decoder details');
    },
  };

  render(() => <AssetCatalogueView reader={reader} tenantId="tenant-a" />);

  const alert = await screen.findByRole('alert');
  expect(alert.textContent).toContain('invalid response');
  expect(alert.textContent).not.toContain('Sensitive decoder details');
});

test('handles a synchronous adapter request error', async () => {
  const reader: AssetCatalogueReader = {
    listPage() {
      throw new AssetPageRequestError('Invalid cursor');
    },
  };

  render(() => <AssetCatalogueView reader={reader} tenantId="tenant-a" />);

  expect((await screen.findByRole('alert')).textContent).toContain(
    'request is invalid',
  );
});
