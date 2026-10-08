import { useLocation, useSearchParams } from '@solidjs/router';
import { createMemo, Show } from 'solid-js';
import type { AlertQuery, AlertRecord } from '../model/alert-triage';
import {
  filterAndSortAlerts,
  parseAlertQuery,
  requestedAlertId,
  selectAlert,
  summarizeAlertQueue,
  toAlertSearchParams,
} from '../model/alert-triage';
import { AlertEvidence } from './AlertEvidence';
import { AlertQueue } from './AlertQueue';
import { AlertSummary } from './AlertSummary';

/** One URL owns queue filters and selection; sample evidence is read-only. */
export function AlertsWorkspace(props: {
  readonly scene: {
    readonly source: 'sample';
    readonly tenantId: string;
    readonly asOf: string;
    readonly alerts: readonly AlertRecord[];
  };
}) {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const query = createMemo(() =>
    parseAlertQuery(new URLSearchParams(location.search)),
  );
  const visible = createMemo(() =>
    filterAndSortAlerts(props.scene.alerts, query()),
  );
  const requested = createMemo(() =>
    requestedAlertId(new URLSearchParams(location.search)),
  );
  const selection = createMemo(() => selectAlert(visible(), requested()));
  const summary = summarizeAlertQueue(props.scene.alerts);

  const setQuery = (next: AlertQuery, replace = false) => {
    const params = toAlertSearchParams(
      next,
      new URLSearchParams(location.search),
    );
    setSearchParams(
      {
        q: params.get('q') ?? undefined,
        severity: params.get('severity') ?? undefined,
        state: params.get('state') ?? undefined,
      },
      { replace },
    );
  };
  const clearFilters = () =>
    setSearchParams({
      q: undefined,
      severity: undefined,
      state: undefined,
      alert: undefined,
    });
  const select = (id: string) => setSearchParams({ alert: id });

  return (
    <div class="grid min-w-0 gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-sample-outline bg-sample-surface px-3 py-2 text-xs text-muted">
        <span>
          Development preview · every alert and observation is synthetic
        </span>
        <span>Read-only · no alert lifecycle is connected</span>
      </div>
      <AlertSummary summary={summary} asOf={props.scene.asOf} />
      <p role="status" class="sr-only">
        {selection().alert
          ? `Selected sample alert: ${selection().alert?.title}`
          : selection().unavailable
            ? 'Requested sample alert is not in the filtered queue.'
            : 'No sample alert selected.'}
      </p>
      <div class="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(18rem,0.84fr)_minmax(0,1.25fr)]">
        <AlertQueue
          allCount={summary.total}
          alerts={visible()}
          query={query()}
          selectedId={selection().alert?.id ?? null}
          asOf={props.scene.asOf}
          onSearch={(value) => setQuery({ ...query(), search: value }, true)}
          onSeverity={(value) => setQuery({ ...query(), severity: value })}
          onState={(value) => setQuery({ ...query(), state: value })}
          onClear={clearFilters}
          onSelect={select}
        />
        <Show
          when={selection().alert}
          fallback={
            <section
              id="alert-evidence"
              aria-label="Selected alert evidence"
              class="grid gap-3 rounded-lg border border-sample-outline bg-sample-surface p-5"
            >
              <h2 class="text-sm font-semibold">
                {selection().unavailable
                  ? 'Selected alert is not in this queue'
                  : 'No sample alert to inspect'}
              </h2>
              <p class="text-sm text-muted">
                {selection().unavailable
                  ? 'The URL selection is unknown or excluded by the current filters. Clear the selection or choose a visible row.'
                  : 'Change the queue filters to show a sample incident.'}
              </p>
              <Show when={selection().unavailable}>
                <button
                  type="button"
                  onClick={() => setSearchParams({ alert: undefined })}
                  class="justify-self-start font-semibold text-accent underline"
                >
                  Clear selection
                </button>
              </Show>
            </section>
          }
        >
          {(alert) => <AlertEvidence alert={alert()} asOf={props.scene.asOf} />}
        </Show>
      </div>
    </div>
  );
}
