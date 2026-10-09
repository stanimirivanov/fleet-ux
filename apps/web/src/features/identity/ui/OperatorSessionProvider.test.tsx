import { createMemoryHistory, MemoryRouter, Route } from '@solidjs/router';
import { cleanup, render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { onCleanup, onMount } from 'solid-js';
import { afterEach, expect, test, vi } from 'vitest';
import { RequestFailure } from '#shared/model';
import type {
  OperatorSession,
  OperatorSessionService,
} from '../model/operator-session';
import { OperatorAccessBoundary } from './OperatorAccessBoundary';
import { OperatorAccountControl } from './OperatorAccountControl';
import {
  OperatorSessionProvider,
  useOperatorSession,
} from './OperatorSessionProvider';

const active = (): OperatorSession => ({
  actorId: 'operator-1',
  expiresAtMs: Date.now() + 60_000,
});
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.useRealTimers();
});
function mount(
  service: OperatorSessionService,
  initial = '/assets?tenant=tenant-a',
  onProtected?: () => void,
  onProtectedCleanup?: () => void,
) {
  const history = createMemoryHistory();
  history.set({ value: initial, replace: true });
  function ProtectedEvidence() {
    onMount(() => onProtected?.());
    onCleanup(() => onProtectedCleanup?.());
    return <p>Authorized metadata</p>;
  }
  const view = render(() => (
    <MemoryRouter
      history={history}
      root={(props) => (
        <OperatorSessionProvider service={service}>
          <OperatorAccountControl />
          {props.children}
        </OperatorSessionProvider>
      )}
    >
      <Route
        path="*"
        component={() => (
          <OperatorAccessBoundary>
            <ProtectedEvidence />
          </OperatorAccessBoundary>
        )}
      />
    </MemoryRouter>
  ));
  return { ...view, history };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

test('protected children mount only after valid session inspection', async () => {
  const session = deferred<OperatorSession>();
  const protectedMount = vi.fn();
  mount(
    { inspect: () => session.promise, signOut: async () => {} },
    undefined,
    protectedMount,
  );
  expect(screen.queryByText('Authorized metadata')).toBeNull();
  expect(protectedMount).not.toHaveBeenCalled();
  session.resolve(active());
  expect(await screen.findByText('Authorized metadata')).toBeTruthy();
  expect(protectedMount).toHaveBeenCalledOnce();
});

test.each(['unauthorized', 'not-found'] as const)(
  'renders session failure %s without loading protected content',
  async (kind) => {
    const protectedMount = vi.fn();
    mount(
      {
        inspect: async () => {
          throw new RequestFailure(kind);
        },
        signOut: async () => {},
      },
      undefined,
      protectedMount,
    );
    const title =
      kind === 'unauthorized' ? 'Sign in to FleetIQ' : 'Sign-in unavailable';
    expect(await screen.findByRole('heading', { name: title })).toBeTruthy();
    expect(protectedMount).not.toHaveBeenCalled();
  },
);

test('invalidates on metadata authorization loss and preserves a safe login return', async () => {
  let invalidate: (() => void) | undefined;
  function Trigger() {
    const session = useOperatorSession();
    invalidate = session.invalidate;
    return (
      <OperatorAccessBoundary>
        <p>Authorized metadata</p>
      </OperatorAccessBoundary>
    );
  }
  const history = createMemoryHistory();
  history.set({ value: '/assets/asset-1?tenant=tenant-a', replace: true });
  render(() => (
    <MemoryRouter
      history={history}
      root={(props) => (
        <OperatorSessionProvider
          service={{ inspect: async () => active(), signOut: async () => {} }}
        >
          {props.children}
        </OperatorSessionProvider>
      )}
    >
      <Route path="*" component={Trigger} />
    </MemoryRouter>
  ));
  await screen.findByText('Authorized metadata');
  invalidate?.();
  const link = await screen.findByRole('link', { name: 'Sign in' });
  expect(link.getAttribute('href')).toBe('/api/v1/auth/login');
  // Dispatch without navigating jsdom out of the app.
  link.addEventListener('click', (event) => event.preventDefault(), {
    once: true,
  });
  await userEvent.setup().click(link);
  expect(sessionStorage.getItem('fleetiq.operator-return.v1')).toBe(
    '/assets/asset-1?tenant=tenant-a',
  );
  expect(screen.queryByText('Authorized metadata')).toBeNull();
});

test('restores a remembered metadata route only after the fixed callback entry authenticates', async () => {
  sessionStorage.setItem(
    'fleetiq.operator-return.v1',
    '/assets/registry/review?tenant=tenant-a',
  );
  const view = mount(
    { inspect: async () => active(), signOut: async () => {} },
    '/',
  );
  await waitFor(() =>
    expect(view.history.get()).toBe('/assets/registry/review?tenant=tenant-a'),
  );
  expect(sessionStorage.getItem('fleetiq.operator-return.v1')).toBeNull();
});

test('failed logout immediately hides evidence and exposes an explicit retry', async () => {
  let logoutCalls = 0;
  const first = deferred<void>();
  const view = mount({
    inspect: async () => active(),
    signOut: () => {
      logoutCalls += 1;
      return logoutCalls === 1
        ? first.promise.then(() => {
            throw new RequestFailure('unavailable');
          })
        : Promise.resolve();
    },
  });
  await screen.findByText('Authorized metadata');
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Operator account' }));
  expect(screen.getByText('operator-1')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(screen.queryByText('Authorized metadata')).toBeNull();
  first.resolve();
  await screen.findByRole('heading', { name: 'Sign-out not confirmed' });
  await user.click(screen.getByRole('button', { name: 'Retry sign-out' }));
  await screen.findByRole('heading', { name: 'Sign in to FleetIQ' });
  expect(logoutCalls).toBe(2);
  view.unmount();
});

test('focus refresh cancels superseded inspection and unmount cancels the current read', async () => {
  const first = deferred<OperatorSession>();
  const second = deferred<OperatorSession>();
  const signals: AbortSignal[] = [];
  const view = mount({
    inspect: (options) => {
      if (!options?.signal) throw new Error('Signal missing');
      signals.push(options.signal);
      return signals.length === 1 ? first.promise : second.promise;
    },
    signOut: async () => {},
  });
  window.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(signals).toHaveLength(2));
  expect(signals[0]?.aborted).toBe(true);
  first.resolve(active());
  await first.promise;
  expect(screen.queryByText('Authorized metadata')).toBeNull();
  view.unmount();
  expect(signals[1]?.aborted).toBe(true);
  second.resolve(active());
});

test('expiry removes protected evidence without a new metadata request', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  mount({
    inspect: async () => ({ ...active(), expiresAtMs: Date.now() + 10 }),
    signOut: async () => {},
  });
  await vi.advanceTimersByTimeAsync(0);
  expect(screen.getByText('Authorized metadata')).toBeTruthy();
  await vi.advanceTimersByTimeAsync(11);
  expect(screen.queryByText('Authorized metadata')).toBeNull();
  expect(
    screen.getByRole('heading', { name: 'Sign in to FleetIQ' }),
  ).toBeTruthy();
});

test('an account change remounts protected ownership and cancels prior operator evidence', async () => {
  let inspections = 0;
  const mounted = vi.fn();
  const released = vi.fn();
  mount(
    {
      inspect: async () => ({
        ...active(),
        actorId: ++inspections === 1 ? 'operator-a' : 'operator-b',
      }),
      signOut: async () => {},
    },
    undefined,
    mounted,
    released,
  );
  await screen.findByText('Authorized metadata');
  expect(mounted).toHaveBeenCalledOnce();
  window.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(mounted).toHaveBeenCalledTimes(2));
  expect(released).toHaveBeenCalledOnce();
  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: 'Operator account' }));
  expect(screen.getByText('operator-b')).toBeTruthy();
});
