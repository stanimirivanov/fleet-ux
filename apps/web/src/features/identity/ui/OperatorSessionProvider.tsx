import { useLocation, useNavigate } from '@solidjs/router';
import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  type ParentProps,
  useContext,
} from 'solid-js';
import { RequestFailure } from '#shared/model';
import {
  type OperatorSession,
  type OperatorSessionService,
  operatorReturnPath,
} from '../model/operator-session';

export type OperatorSessionState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'authenticated'; readonly session: OperatorSession }
  | { readonly kind: 'signed-out' }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'logout-failed' };

interface OperatorSessionController {
  readonly state: () => OperatorSessionState;
  readonly refresh: () => void;
  readonly invalidate: () => void;
  readonly rememberReturn: () => void;
  readonly signOut: () => void;
}
const SessionContext = createContext<OperatorSessionController>();
const RETURN_KEY = 'fleetiq.operator-return.v1';

/** Owns session inspection, expiry, refresh, and cancellation for one app mount. */
export function OperatorSessionProvider(
  props: ParentProps<{ readonly service: OperatorSessionService }>,
) {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = createSignal<OperatorSessionState>({
    kind: 'loading',
  });
  let request: AbortController | undefined;
  let disposed = false;
  let signingOut = false;
  const begin = () => {
    request?.abort();
    request = new AbortController();
    return request;
  };
  const invalidate = () => {
    request?.abort();
    setState({ kind: 'signed-out' });
  };
  const restoreReturn = () => {
    if (location.pathname !== '/') return;
    try {
      const target = operatorReturnPath(sessionStorage.getItem(RETURN_KEY));
      sessionStorage.removeItem(RETURN_KEY);
      if (target) navigate(target, { replace: true });
    } catch {
      /* Restricted browser storage cannot prevent ordinary sign-in. */
    }
  };
  const refresh = () => {
    if (disposed || signingOut) return;
    const active = begin();
    void props.service.inspect({ signal: active.signal }).then(
      (session) => {
        if (disposed || active.signal.aborted) return;
        setState({ kind: 'authenticated', session });
        restoreReturn();
      },
      (cause: unknown) => {
        if (disposed || active.signal.aborted) return;
        setState(
          cause instanceof RequestFailure && cause.kind === 'unauthorized'
            ? { kind: 'signed-out' }
            : { kind: 'unavailable' },
        );
      },
    );
  };
  const signOut = () => {
    if (disposed || signingOut) return;
    signingOut = true;
    const active = begin();
    // Remove protected views immediately; never claim successful server logout
    // if its request fails. The explicit failure state retains a retry action.
    setState({ kind: 'loading' });
    try {
      sessionStorage.removeItem(RETURN_KEY);
    } catch {
      /* Optional storage. */
    }
    void props.service.signOut({ signal: active.signal }).then(
      () => {
        if (!disposed && !active.signal.aborted)
          setState({ kind: 'signed-out' });
        signingOut = false;
      },
      () => {
        if (!disposed && !active.signal.aborted)
          setState({ kind: 'logout-failed' });
        signingOut = false;
      },
    );
  };
  const rememberReturn = () => {
    const target = operatorReturnPath(location.pathname + location.search);
    try {
      if (target) sessionStorage.setItem(RETURN_KEY, target);
      else sessionStorage.removeItem(RETURN_KEY);
    } catch {
      /* The fixed provider return still reaches the application. */
    }
  };
  const onFocus = () => {
    if (state().kind !== 'logout-failed') refresh();
  };
  onMount(() => {
    refresh();
    window.addEventListener('focus', onFocus);
  });
  onCleanup(() => {
    disposed = true;
    request?.abort();
    window.removeEventListener('focus', onFocus);
  });
  createEffect(() => {
    const current = state();
    if (current.kind !== 'authenticated') return;
    const delay = Math.max(0, current.session.expiresAtMs - Date.now());
    const timer = window.setTimeout(
      () => {
        if (current.session.expiresAtMs <= Date.now()) invalidate();
        else refresh();
      },
      Math.min(delay, 2_147_483_647),
    );
    onCleanup(() => window.clearTimeout(timer));
  });
  return (
    <SessionContext.Provider
      value={{ state, refresh, invalidate, rememberReturn, signOut }}
    >
      {props.children}
    </SessionContext.Provider>
  );
}

export function useOperatorSession(): OperatorSessionController {
  const session = useContext(SessionContext);
  if (!session) throw new Error('Operator session provider is required');
  return session;
}
