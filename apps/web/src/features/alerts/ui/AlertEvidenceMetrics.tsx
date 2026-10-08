import { Show } from 'solid-js';
import { StatusBadge } from '#shared/ui';
import type { AlertRecord, AlertSignalEvidence } from '../model/alert-triage';
import { formatAlertAge, formatAlertTime } from './alert-format';

function referenceLabel(evidence: AlertSignalEvidence): string {
  const band = evidence.referenceBand;
  if (!band) return 'No validated threshold';
  if (band.lower !== null && band.upper !== null) {
    return `${band.lower}–${band.upper} ${evidence.unit}`;
  }
  if (band.upper !== null) return `At most ${band.upper} ${evidence.unit}`;
  if (band.lower !== null) return `At least ${band.lower} ${evidence.unit}`;
  return 'No validated threshold';
}

/** Separate condition evidence from alert review state and signal trust. */
export function AlertEvidenceMetrics(props: {
  readonly alert: AlertRecord;
  readonly primary: AlertSignalEvidence | null;
  readonly asOf: string;
}) {
  return (
    <div class="grid gap-px overflow-hidden rounded-md border border-outline bg-outline sm:grid-cols-2 2xl:grid-cols-4">
      <div class="min-w-0 bg-surface p-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Observed
        </p>
        <p class="mt-1 text-xl font-semibold tabular-nums">
          {props.primary?.value === null || !props.primary
            ? 'Not observed'
            : `${props.primary.value} ${props.primary.unit}`}
        </p>
        <p class="mt-1 text-xs text-muted">
          {props.primary?.label ?? 'No signal evidence'}
        </p>
      </div>
      <div class="min-w-0 bg-surface p-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Reference
        </p>
        <p class="mt-1 text-sm font-semibold tabular-nums">
          {props.primary ? referenceLabel(props.primary) : 'Unavailable'}
        </p>
        <p class="mt-1 text-xs text-muted">{props.alert.triggerCondition}</p>
      </div>
      <div class="min-w-0 bg-surface p-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">
          First seen
        </p>
        <p class="mt-1 text-sm font-semibold tabular-nums">
          {formatAlertTime(props.alert.firstSeen)}
        </p>
        <p class="mt-1 text-xs text-muted">Sample incident start</p>
      </div>
      <div class="min-w-0 bg-surface p-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Last seen
        </p>
        <p class="mt-1 text-sm font-semibold tabular-nums">
          {formatAlertTime(props.alert.lastSeen)}
        </p>
        <p class="mt-1 text-xs text-muted">
          {formatAlertAge(props.alert.lastSeen, props.asOf)} before snapshot
        </p>
      </div>
      <Show when={props.primary}>
        {(evidence) => (
          <div class="flex flex-wrap items-center gap-2 bg-surface px-3 py-2 text-xs sm:col-span-2 2xl:col-span-4">
            <span class="text-muted">Signal freshness</span>
            <StatusBadge
              label={evidence().freshness}
              tone={
                evidence().freshness === 'current'
                  ? 'nominal'
                  : evidence().freshness === 'stale'
                    ? 'warning'
                    : 'unknown'
              }
            />
            <span class="ml-2 text-muted">Quality</span>
            <StatusBadge
              label={evidence().quality}
              tone={evidence().quality === 'good' ? 'nominal' : 'unknown'}
            />
            <span class="text-muted">
              Event: {formatAlertTime(evidence().eventAt)} · Received:{' '}
              {formatAlertTime(evidence().receivedAt)}
            </span>
          </div>
        )}
      </Show>
    </div>
  );
}
