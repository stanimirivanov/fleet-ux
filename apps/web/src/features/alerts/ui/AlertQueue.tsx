import { For, Show } from 'solid-js';
import type { AlertQuery, AlertRecord } from '../model/alert-triage';
import { AlertPanel } from './AlertPanel';
import { AlertQueueRow } from './AlertQueueRow';

export function AlertQueue(props: {
  readonly allCount: number;
  readonly alerts: readonly AlertRecord[];
  readonly query: AlertQuery;
  readonly selectedId: string | null;
  readonly asOf: string;
  readonly onSearch: (value: string) => void;
  readonly onSeverity: (value: AlertQuery['severity']) => void;
  readonly onState: (value: AlertQuery['state']) => void;
  readonly onClear: () => void;
  readonly onSelect: (id: string) => void;
}) {
  return (
    <AlertPanel
      title={`Alert queue (${props.alerts.length})`}
      description={`${props.allCount} sample incidents at the fixed snapshot · priority, state, latest evidence`}
    >
      <div class="grid gap-2 border-b border-outline p-3 sm:p-4">
        <label class="grid gap-1 text-[11px] font-semibold text-muted">
          Search alerts
          <input
            type="search"
            maxLength={120}
            value={props.query.search}
            onInput={(event) => props.onSearch(event.currentTarget.value)}
            placeholder="Asset, component, issue"
            class="min-w-0 rounded-md border border-outline bg-surface px-3 py-2 text-sm font-normal text-foreground"
          />
        </label>
        <div class="grid gap-2 sm:grid-cols-2">
          <label class="grid gap-1 text-[11px] font-semibold text-muted">
            Severity
            <select
              value={props.query.severity}
              onChange={(event) =>
                props.onSeverity(
                  event.currentTarget.value as AlertQuery['severity'],
                )
              }
              class="min-w-0 rounded-md border border-outline bg-surface px-3 py-2 text-sm font-normal text-foreground"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="attention">Warning</option>
              <option value="information">Information</option>
            </select>
          </label>
          <label class="grid gap-1 text-[11px] font-semibold text-muted">
            Review state
            <select
              value={props.query.state}
              onChange={(event) =>
                props.onState(event.currentTarget.value as AlertQuery['state'])
              }
              class="min-w-0 rounded-md border border-outline bg-surface px-3 py-2 text-sm font-normal text-foreground"
            >
              <option value="all">All states</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>
      </div>
      <Show
        when={props.alerts.length > 0}
        fallback={
          <div class="grid justify-items-start gap-2 p-5 text-sm">
            <p>No sample alerts match these filters.</p>
            <button
              type="button"
              onClick={props.onClear}
              class="font-semibold text-accent underline"
            >
              Clear filters
            </button>
          </div>
        }
      >
        <ul aria-label="Filtered sample alerts">
          <For each={props.alerts}>
            {(alert) => (
              <AlertQueueRow
                alert={alert}
                selected={props.selectedId === alert.id}
                asOf={props.asOf}
                onSelect={props.onSelect}
              />
            )}
          </For>
        </ul>
      </Show>
    </AlertPanel>
  );
}
