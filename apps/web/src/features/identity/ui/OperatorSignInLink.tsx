import { useOperatorSession } from './OperatorSessionProvider';

/** Login is a full browser navigation; API fetch must not follow provider redirects. */
export function OperatorSignInLink() {
  const operator = useOperatorSession();
  return (
    <a
      href="/api/v1/auth/login"
      onClick={operator.rememberReturn}
      class="fi-action-button"
      rel="external noreferrer"
    >
      Sign in
    </a>
  );
}
