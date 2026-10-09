import { Match, type ParentProps, Show, Switch } from 'solid-js';
import { useOperatorSession } from './OperatorSessionProvider';
import { OperatorSignInLink } from './OperatorSignInLink';

/** Authorization is still evaluated by the backend for each metadata request. */
export function OperatorAccessBoundary(props: ParentProps) {
  const operator = useOperatorSession();
  const actorId = () => {
    const state = operator.state();
    return state.kind === 'authenticated' ? state.session.actorId : null;
  };
  return (
    <Switch>
      <Match when={operator.state().kind === 'authenticated'}>
        <Show when={actorId()} keyed>
          {(_actorId) => props.children}
        </Show>
      </Match>
      <Match when={operator.state().kind === 'loading'}>
        <p role="status" class="text-sm text-muted">
          Checking operator session…
        </p>
      </Match>
      <Match when={operator.state().kind === 'signed-out'}>
        <section
          aria-label="Sign in to FleetIQ"
          class="rounded-lg border border-outline bg-surface p-5"
        >
          <h2 class="text-lg font-semibold">Sign in to FleetIQ</h2>
          <p class="mt-2 text-sm text-muted">
            Sign in with your operator account to open authorized tenant
            metadata.
          </p>
          <div class="mt-4">
            <OperatorSignInLink />
          </div>
        </section>
      </Match>
      <Match when={operator.state().kind === 'logout-failed'}>
        <section
          aria-label="Sign-out not confirmed"
          role="alert"
          class="rounded-lg border border-status-warning bg-surface p-5"
        >
          <h2 class="text-lg font-semibold">Sign-out not confirmed</h2>
          <p class="mt-2 text-sm text-muted">
            Protected data is hidden. The server could not confirm sign-out;
            retry before leaving this device.
          </p>
          <button
            type="button"
            class="fi-action-button mt-4"
            onClick={operator.signOut}
          >
            Retry sign-out
          </button>
        </section>
      </Match>
      <Match when={operator.state().kind === 'unavailable'}>
        <section
          aria-label="Sign-in unavailable"
          class="rounded-lg border border-outline bg-surface p-5"
        >
          <h2 class="text-lg font-semibold">Sign-in unavailable</h2>
          <p class="mt-2 text-sm text-muted">
            The sign-in service is unavailable. Retry or contact your
            administrator. No fleet data has been loaded.
          </p>
          <button
            type="button"
            class="fi-action-button mt-4"
            onClick={operator.refresh}
          >
            Retry sign-in
          </button>
        </section>
      </Match>
    </Switch>
  );
}
