import { For, Show } from 'solid-js';
import { StatusBadge } from '#shared/ui';
import type { AlertSignalEvidence } from '../model/alert-triage';
import { AlertPanel } from './AlertPanel';
import { formatAlertTime } from './alert-format';

/** Provenance remains visible even when a signal reading is missing or stale. */
export function AlertSourceContext(props: {
  readonly evidence: readonly AlertSignalEvidence[];
}) {
  return (
    <AlertPanel
      title="Evidence context"
      description="Source, quality, and arrival time"
    >
      <Show
        when={props.evidence.length > 0}
        fallback={
          <p class="p-5 text-sm text-muted">No source evidence is modeled.</p>
        }
      >
        <ul class="divide-y divide-outline">
          <For each={props.evidence}>
            {(reading) => (
              <li class="grid gap-2 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h3 class="text-sm font-semibold">{reading.label}</h3>
                  <StatusBadge
                    label={reading.freshness}
                    tone={
                      reading.freshness === 'current'
                        ? 'nominal'
                        : reading.freshness === 'stale'
                          ? 'warning'
                          : 'unknown'
                    }
                  />
                </div>
                <p class="text-sm tabular-nums">
                  {reading.value === null
                    ? 'Not observed'
                    : `${reading.value} ${reading.unit}`}
                </p>
                <p class="text-xs text-muted">{reading.note}</p>
                <dl class="grid gap-1 text-xs">
                  <div class="flex flex-wrap gap-1">
                    <dt class="font-semibold">Quality:</dt>
                    <dd>{reading.quality}</dd>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <dt class="font-semibold">Event:</dt>
                    <dd class="tabular-nums">
                      {formatAlertTime(reading.eventAt)}
                    </dd>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <dt class="font-semibold">Received:</dt>
                    <dd class="tabular-nums">
                      {formatAlertTime(reading.receivedAt)}
                    </dd>
                  </div>
                </dl>
                <Show
                  when={reading.source}
                  fallback={
                    <p class="text-xs text-muted">Source unavailable</p>
                  }
                >
                  {(source) => (
                    <p class="break-words border-t border-outline pt-2 text-[11px] text-muted">
                      {source().gatewayId} · {source().endpointId} ·{' '}
                      {source().signalId}
                    </p>
                  )}
                </Show>
              </li>
            )}
          </For>
        </ul>
      </Show>
      <p class="border-t border-outline px-4 py-3 text-xs text-muted">
        Ownership and acknowledgment need an audited alert lifecycle.
      </p>
    </AlertPanel>
  );
}
