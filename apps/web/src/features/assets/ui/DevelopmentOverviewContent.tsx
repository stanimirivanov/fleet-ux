import { getDemoOverview } from '../demo/overview-fixture';
import { OverviewDashboard } from './overview/OverviewDashboard';

const sample = getDemoOverview('tenant-a');

/** Development-only composition; Vite excludes this import from production. */
export default function DevelopmentOverviewContent() {
  return <OverviewDashboard overview={sample} />;
}
