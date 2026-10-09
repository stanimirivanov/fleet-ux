import type { BrowserApi } from '#shared/api';
import { RequestFailure } from '#shared/model';
import type { OperatorSessionService } from '../model/operator-session';

/** Session HTTP stays behind the same managed runtime as metadata requests. */
export function createOperatorSessionService(
  browser: BrowserApi,
): OperatorSessionService {
  return {
    async inspect(options) {
      const value = await browser.run(
        (api) => api.getOperatorSession(undefined),
        options,
      );
      if (
        !value.actor_id ||
        [...value.actor_id].length > 128 ||
        value.actor_id.trim() !== value.actor_id ||
        /\p{Cc}/u.test(value.actor_id) ||
        !Number.isSafeInteger(value.expires_at_ms)
      ) {
        throw new RequestFailure('invalid-response');
      }
      if (value.expires_at_ms <= Date.now())
        throw new RequestFailure('unauthorized');
      return { actorId: value.actor_id, expiresAtMs: value.expires_at_ms };
    },
    async signOut(options) {
      // Origin is required by the contract. The browser adapter removes that
      // forbidden header before fetch; the browser supplies its actual Origin.
      await browser.run(
        (api) =>
          api.endOperatorSession({
            params: { Origin: browser.origin, 'X-FleetIQ-CSRF': '1' },
          }),
        options,
      );
    },
  };
}
