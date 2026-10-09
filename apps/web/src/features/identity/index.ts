/** Deliberate public entry for app-owned session composition. */
export { createOperatorSessionService } from './api/browser-session-service';
export type { OperatorSessionService } from './model/operator-session';
export { OperatorAccessBoundary } from './ui/OperatorAccessBoundary';
export {
  OperatorAccountControl,
  operatorConnectionLabel,
} from './ui/OperatorAccountControl';
export {
  OperatorSessionProvider,
  useOperatorSession,
} from './ui/OperatorSessionProvider';
