import { StatusBadge } from '#shared/ui';
import { MetadataPanel } from './MetadataPanel';

/** Capability gaps are explicit; production never displays illustrative operations. */
export function UnavailableOperations() {
  return (
    <MetadataPanel
      title="Operational evidence"
      description="Current metadata does not expose live positions, telemetry values, asset condition, alerts, or timeline history."
    >
      <div class="grid gap-3 sm:grid-cols-3">
        <Capability label="Asset condition" />
        <Capability label="Device connection" />
        <Capability label="Telemetry freshness" />
      </div>
      <div class="mt-4 rounded-lg border border-dashed border-outline bg-canvas p-4">
        <p class="text-xs font-semibold">Telemetry & timeline</p>
        <p class="mt-2 text-xs leading-5 text-muted">
          A backend operational read model is required. Binding metadata alone
          cannot establish observed values, freshness, anomaly status, or
          historical measurements.
        </p>
      </div>
    </MetadataPanel>
  );
}
function Capability(props: { readonly label: string }) {
  return (
    <div class="rounded-lg border border-outline bg-canvas p-3">
      <p class="mb-2 text-xs text-muted">{props.label}</p>
      <StatusBadge label="Unavailable" tone="unknown" />
    </div>
  );
}
