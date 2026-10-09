import { createSignal, createUniqueId, Show } from 'solid-js';
import {
  type OperatorSessionState,
  useOperatorSession,
} from './OperatorSessionProvider';
import { OperatorSignInLink } from './OperatorSignInLink';

/** The disclosure owns its interaction state; provider owns operator evidence. */
export function OperatorAccountControl() {
  const operator = useOperatorSession();
  const [open, setOpen] = createSignal(false);
  const id = createUniqueId();
  let trigger: HTMLButtonElement | undefined;
  const authenticated = () => operator.state().kind === 'authenticated';
  const actorId = () => {
    const state = operator.state();
    return state.kind === 'authenticated' ? state.session.actorId : null;
  };
  return (
    <div class="relative">
      <button
        ref={trigger}
        type="button"
        aria-label="Operator account"
        aria-expanded={open()}
        aria-controls={id}
        class="fi-header-icon"
        onClick={() => setOpen(!open())}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          class="size-4.5"
        >
          <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M4 20a8 8 0 0 1 16 0" />
        </svg>
      </button>
      <Show when={open()}>
        <section
          id={id}
          aria-label="Operator account details"
          class="absolute right-0 top-full z-30 mt-2 grid w-64 gap-3 rounded-lg border border-outline bg-surface p-4 shadow-lg"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false);
              trigger?.focus();
            }
          }}
        >
          <Show
            when={authenticated()}
            fallback={
              <Show
                when={operator.state().kind === 'signed-out'}
                fallback={
                  <p class="text-xs text-muted">
                    {operatorConnectionLabel(operator.state())}
                  </p>
                }
              >
                <OperatorSignInLink />
              </Show>
            }
          >
            <p class="break-all text-xs text-muted">
              Operator:{' '}
              <span class="font-semibold text-foreground">{actorId()}</span>
            </p>
            <button
              type="button"
              class="fi-action-button"
              onClick={() => {
                setOpen(false);
                operator.signOut();
              }}
            >
              Sign out
            </button>
          </Show>
          <Show when={operator.state().kind === 'logout-failed'}>
            <button
              type="button"
              class="fi-action-button"
              onClick={operator.signOut}
            >
              Retry sign-out
            </button>
          </Show>
        </section>
      </Show>
    </div>
  );
}

export function operatorConnectionLabel(state: OperatorSessionState): string {
  switch (state.kind) {
    case 'authenticated':
      return 'Operator connected';
    case 'loading':
      return 'Checking operator session';
    case 'signed-out':
      return 'Sign-in required';
    case 'logout-failed':
      return 'Sign-out not confirmed';
    case 'unavailable':
      return 'Sign-in unavailable';
  }
}
