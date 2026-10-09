import { once } from 'node:events';
import { createServer } from 'node:http';

/** A real redirect hop is required: Playwright only routes the initial HTTP request. */
export async function startIdentityDestination() {
  const server = createServer((request, response) => {
    if (
      request.method !== 'GET' ||
      request.url !== '/test-only-identity-provider'
    ) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    });
    response.end('<h1>Test sign-in destination</h1>');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Missing test identity destination address');
  }
  return {
    url: `http://127.0.0.1:${address.port}/test-only-identity-provider`,
    async close(): Promise<void> {
      const closed = new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      server.closeAllConnections();
      await closed;
    },
  };
}
