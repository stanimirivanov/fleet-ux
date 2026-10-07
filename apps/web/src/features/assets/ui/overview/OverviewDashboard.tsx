import type { DemoFleetOverview } from '../../demo/overview-fixture';
import { AssetDiscovery } from './AssetDiscovery';
import { AttentionQueue } from './AttentionQueue';
import { DataQuality } from './DataQuality';
import { FleetMap } from './FleetMap';
import { FleetMetrics } from './FleetMetrics';
import { Utilization } from './Utilization';

/** The route-level dashboard composes complete, independently reviewable panels. */
export function OverviewDashboard(props: {
  readonly overview: DemoFleetOverview;
}) {
  return (
    <div class="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,1fr)]">
      <div class="grid min-w-0 content-start gap-3">
        <FleetMetrics overview={props.overview} />
        <FleetMap overview={props.overview} />
        <AssetDiscovery overview={props.overview} />
      </div>
      <div class="grid min-w-0 content-start gap-3">
        <AttentionQueue overview={props.overview} />
        <DataQuality overview={props.overview} />
        <Utilization overview={props.overview} />
      </div>
    </div>
  );
}
