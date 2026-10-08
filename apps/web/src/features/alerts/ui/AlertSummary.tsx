import type { AlertQueueSummary } from '../model/alert-triage';
import { formatAlertTime } from './alert-format';

/** Priority and review-state counts use the same fixed fixture as the queue. */
export function AlertSummary(props: {
  readonly summary: AlertQueueSummary;
  readonly asOf: string;
}) {
  return (
    <section
      aria-label="Sample alert summary"
      class="grid min-w-0 gap-px overflow-hidden rounded-lg border border-sample-outline bg-outline grid-cols-2 xl:grid-cols-4"
    >
      <div class="bg-sample-surface px-4 py-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Critical
        </p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-status-critical">
          {props.summary.critical}
        </p>
        <p class="text-xs text-muted">Sample incidents</p>
      </div>
      <div class="bg-sample-surface px-4 py-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Warning
        </p>
        <p class="mt-1 text-2xl font-semibold tabular-nums text-status-warning">
          {props.summary.attention}
        </p>
        <p class="text-xs text-muted">All review states</p>
      </div>
      <div class="bg-sample-surface px-4 py-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Open
        </p>
        <p class="mt-1 text-2xl font-semibold tabular-nums">
          {props.summary.open}
        </p>
        <p class="text-xs text-muted">Review state only</p>
      </div>
      <div class="bg-sample-surface px-4 py-3">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Fixed snapshot
        </p>
        <p class="mt-1 text-sm font-semibold tabular-nums">
          {formatAlertTime(props.asOf)}
        </p>
        <p class="text-xs text-muted">Not a live 24-hour total</p>
      </div>
    </section>
  );
}
