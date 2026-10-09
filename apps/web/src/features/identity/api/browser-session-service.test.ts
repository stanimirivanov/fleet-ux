import { afterEach, expect, test } from 'vitest';
import { type BrowserApi, createBrowserApi } from '#shared/api';
import { createOperatorSessionService } from './browser-session-service';

const lifetimes: BrowserApi[] = [];
afterEach(async () => {
  await Promise.all(lifetimes.splice(0).map((api) => api.dispose()));
});
function serviceFor(fetch: typeof globalThis.fetch) {
  const browser = createBrowserApi({ origin: 'https://fleet.invalid', fetch });
  lifetimes.push(browser);
  return createOperatorSessionService(browser);
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

test('projects only validated operator evidence using the managed client', async () => {
  const expiresAtMs = Date.now() + 60_000;
  const service = serviceFor(async (url, init) => {
    expect(String(url)).toBe('https://fleet.invalid/api/v1/auth/session');
    expect(init?.credentials).toBe('same-origin');
    expect(init?.cache).toBe('no-store');
    expect(init?.redirect).toBe('error');
    expect(new Headers(init?.headers).has('authorization')).toBe(false);
    return json({ actor_id: 'operator-1', expires_at_ms: expiresAtMs });
  });
  await expect(service.inspect()).resolves.toEqual({
    actorId: 'operator-1',
    expiresAtMs,
  });
});

test.each([401, 404, 500])(
  'keeps session HTTP %s as an explicit failure',
  async (status) => {
    const service = serviceFor(
      async () => new Response('untrusted body', { status }),
    );
    const kind =
      status === 401
        ? 'unauthorized'
        : status === 404
          ? 'not-found'
          : 'unavailable';
    await expect(service.inspect()).rejects.toMatchObject({ kind });
  },
);

test.each([
  { actor_id: ' operator-1', expires_at_ms: Number.MAX_SAFE_INTEGER },
  { actor_id: 'operator\u0000', expires_at_ms: Number.MAX_SAFE_INTEGER },
  { actor_id: 'operator-1', expires_at_ms: Number.MAX_SAFE_INTEGER + 1 },
  { actor_id: '', expires_at_ms: Number.MAX_SAFE_INTEGER },
])(
  'rejects malformed operator identity before presentation',
  async (payload) => {
    await expect(
      serviceFor(async () => json(payload)).inspect(),
    ).rejects.toMatchObject({ kind: 'invalid-response' });
  },
);

test('does not accept an already expired session', async () => {
  await expect(
    serviceFor(async () =>
      json({ actor_id: 'operator-1', expires_at_ms: Date.now() - 1 }),
    ).inspect(),
  ).rejects.toMatchObject({ kind: 'unauthorized' });
});

test('logout carries only the anti-CSRF header and lets the browser supply Origin', async () => {
  const service = serviceFor(async (url, init) => {
    expect(String(url)).toBe('https://fleet.invalid/api/v1/auth/logout');
    expect(init?.method).toBe('POST');
    const headers = new Headers(init?.headers);
    expect(headers.get('x-fleetiq-csrf')).toBe('1');
    expect(headers.has('origin')).toBe(false);
    expect(headers.has('authorization')).toBe(false);
    return new Response(null, { status: 204 });
  });
  await expect(service.signOut()).resolves.toBeUndefined();
});
