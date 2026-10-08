import { getDemoAlertTriage } from '../demo/alert-fixture';
import { AlertsWorkspace } from './AlertsWorkspace';

const sample = getDemoAlertTriage('tenant-a');

/** Synthetic alert scene; Vite excludes this module and fixture from production. */
export default function DevelopmentAlertsContent() {
  return <AlertsWorkspace scene={sample} />;
}
