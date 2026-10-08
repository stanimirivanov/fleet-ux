import { A } from '@solidjs/router';
import type { AlertRecord } from '../model/alert-triage';
import { AlertEvidenceMetrics } from './AlertEvidenceMetrics';
import { AlertPanel } from './AlertPanel';
import { AlertSourceContext } from './AlertSourceContext';
import { AlertTimeline } from './AlertTimeline';
import { AlertTrend } from './AlertTrend';
import { formatAlertSeverity, formatAlertState } from './alert-format';

/** Selected incident composition: evidence, trend, timeline, and provenance. */
export function AlertEvidence(props: {
  readonly alert: AlertRecord;
  readonly asOf: string;
}) {
  const primary = () => props.alert.evidence[0] ?? null;
  return (
    <section
      id="alert-evidence"
      aria-label="Selected alert evidence"
      class="grid min-w-0 gap-3"
    >
      <AlertPanel title={props.alert.title} description={props.alert.id}>
        <div class="grid gap-4 p-4 sm:p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-accent">
                {formatAlertSeverity(props.alert.severity)} ·{' '}
                {formatAlertState(props.alert.state)}
              </p>
              <p class="mt-1 text-sm text-muted">
                {props.alert.assetLabel} · {props.alert.assetType} ·{' '}
                {props.alert.componentLabel}
              </p>
              <p class="mt-2 text-sm">{props.alert.summary}</p>
            </div>
            <A
              href={`/assets/${encodeURIComponent(props.alert.assetId)}?preview=sample`}
              class="rounded-md border border-outline bg-surface px-3 py-2 text-xs font-semibold text-accent no-underline hover:bg-canvas"
            >
              Open sample asset
            </A>
          </div>
          <AlertEvidenceMetrics
            alert={props.alert}
            primary={primary()}
            asOf={props.asOf}
          />
          <p class="border-l-2 border-status-warning pl-3 text-xs text-muted">
            Preview only. Acknowledgment and resolution are unavailable until
            authorization, lifecycle, and audit contracts exist.
          </p>
        </div>
      </AlertPanel>
      <div class="grid min-w-0 items-start gap-3 2xl:grid-cols-[minmax(0,1.5fr)_minmax(14rem,0.85fr)]">
        <div class="grid min-w-0 gap-3">
          <AlertTrend evidence={primary()} />
          <AlertTimeline entries={props.alert.timeline} />
        </div>
        <AlertSourceContext evidence={props.alert.evidence} />
      </div>
    </section>
  );
}
