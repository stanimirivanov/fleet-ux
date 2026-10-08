import { createMemo, Show } from 'solid-js';
import type { DemoSignal } from '../../demo/inspector-fixture';
import type { LiveSignalReading } from '../../model/live-signal';

function utcTime(value: number | null): string {
  return value === null
    ? 'No observation'
    : new Date(value).toISOString().replace('T', ' ').replace('.000Z', ' UTC');
}

/** A playback reading is distinct from the fixed inspector snapshot. */
export function LiveSignalReadingCard(props: {
  readonly signal: DemoSignal;
  readonly reading: LiveSignalReading | undefined;
}) {
  const reading = createMemo(() => props.reading);
  const measurement = () => reading()?.value;

  return (
    <article class="min-w-0 rounded-lg border border-sample-outline bg-surface p-3">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <h4 class="text-xs font-semibold">{props.signal.label}</h4>
        <span class="text-[10px] font-semibold uppercase tracking-wide text-accent">
          Synthetic playback
        </span>
      </div>
      <div class="mt-3 flex flex-wrap items-baseline gap-1">
        <strong class="text-xl font-semibold tabular-nums">
          {measurement() === null || measurement() === undefined
            ? '—'
            : measurement()}
        </strong>
        <span class="text-xs text-muted">
          {measurement() === null || measurement() === undefined
            ? 'No played observation'
            : (reading()?.unit ?? '')}
        </span>
      </div>
      <dl class="mt-2 grid gap-1 border-t border-outline pt-2 text-[11px] sm:grid-cols-2">
        <div>
          <dt class="inline text-muted">Event · </dt>
          <dd class="inline">{utcTime(reading()?.eventAtMs ?? null)}</dd>
        </div>
        <div>
          <dt class="inline text-muted">Received · </dt>
          <dd class="inline">{utcTime(reading()?.receivedAtMs ?? null)}</dd>
        </div>
        <div>
          <dt class="inline text-muted">Quality · </dt>
          <dd class="inline capitalize">
            {reading()?.quality.replace('-', ' ') ?? 'Not observed'}
          </dd>
        </div>
        <div>
          <dt class="inline text-muted">Freshness · </dt>
          <dd class="inline capitalize">{reading()?.freshness ?? 'Missing'}</dd>
        </div>
        <div>
          <dt class="inline text-muted">Sequence · </dt>
          <dd class="inline font-mono">{reading()?.sequence ?? '—'}</dd>
        </div>
        <div>
          <dt class="inline text-muted">Binding · </dt>
          <dd class="inline font-mono">
            {props.signal.binding.id} r{props.signal.binding.revision}
          </dd>
        </div>
      </dl>
      <Show when={reading()?.sync === 'resnapshot-required'}>
        <p class="mt-2 rounded border border-status-warning/30 bg-status-warning/5 p-2 text-[11px] text-status-warning">
          Revision gap · waiting for a complete resnapshot. Last trusted value
          is retained.
        </p>
      </Show>
      <Show
        when={
          (reading()?.duplicateCount ?? 0) > 0 ||
          (reading()?.gapCount ?? 0) > 0 ||
          reading()?.lateArrival
        }
      >
        <p class="mt-2 text-[11px] text-muted">
          {reading()?.duplicateCount ?? 0} duplicate ignored ·{' '}
          {reading()?.gapCount ?? 0} gap detected
          <Show when={reading()?.lateArrival}> · Late arrival</Show>
        </p>
      </Show>
    </article>
  );
}
