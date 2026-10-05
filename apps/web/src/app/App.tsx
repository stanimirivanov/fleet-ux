import { useAtomValue } from '@effect/atom-solid';
import * as Atom from 'effect/reactivity/Atom';

// The scaffold has no transport yet. Keep this explicit until the API contract
// and mock/live adapters arrive in their own reviewable changes.
const connectionState = Atom.make('unconfigured' as const);

export function App() {
  const status = useAtomValue(() => connectionState);

  return (
    <main>
      <h1>FleetIQ</h1>
      <p>SolidJS web foundation is ready.</p>
      <p role="status">Backend connection: {status()}</p>
    </main>
  );
}
