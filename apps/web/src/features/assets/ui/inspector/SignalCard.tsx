import type { DemoSignal } from '../../demo/inspector-fixture';
import { formatSampleTime } from './inspector-format';

/** One attributed signal; missing evidence remains an explicit state. */
export function SignalCard(props: {
  readonly signal: DemoSignal;
  readonly sourceLabel: string;
}) {
  return (
    <article class="min-w-0 rounded-lg border border-sample-outline bg-sample-surface p-3 shadow-sm">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-xs font-semibold text-muted">{props.signal.label}</h3>
        <span class="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-accent">
          Sample data
        </span>
      </div>
      <div class="mt-3 flex flex-wrap items-baseline gap-1">
        <strong class="text-2xl font-semibold tabular-nums leading-none">
          {props.signal.value ?? '—'}
        </strong>
        <span class="text-sm text-muted">
          {props.signal.value === null ? 'No observation' : props.signal.unit}
        </span>
      </div>
      <p class="mt-2 text-[11px] text-muted">
        {props.signal.referenceBand
          ? 'Illustrative band ' +
            props.signal.referenceBand.min +
            '–' +
            props.signal.referenceBand.max +
            ' ' +
            (props.signal.unit ?? '')
          : 'No reference band defined'}
      </p>
      <div class="mt-3 grid gap-0.5 border-t border-outline pt-2 text-[11px] text-muted">
        <span>Event: {formatSampleTime(props.signal.eventAt)}</span>
        <span>Received: {formatSampleTime(props.signal.receivedAt)}</span>
        <span>Quality: {props.signal.quality.replace('-', ' ')}</span>
        <span>
          Source: {props.sourceLabel} · {props.signal.source.endpointId}
        </span>
      </div>
    </article>
  );
}
