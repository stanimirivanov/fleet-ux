import { For, Show } from 'solid-js';
import type { AlertTimelineEntry } from '../model/alert-triage';
import { AlertPanel } from './AlertPanel';
import { formatAlertTime } from './alert-format';

/** Event sequence is explanatory evidence, not a mutable alert workflow. */
export function AlertTimeline(props: {
  readonly entries: readonly AlertTimelineEntry[];
}) {
  return (
    <AlertPanel
      title="Event timeline"
      description="At the fixed sample snapshot"
    >
      <Show
        when={props.entries.length > 0}
        fallback={
          <p class="p-5 text-sm text-muted">No timeline events are modeled.</p>
        }
      >
        <ol class="divide-y divide-outline px-4 sm:px-5">
          <For each={props.entries}>
            {(entry) => (
              <li class="grid gap-1 py-3 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-3">
                <time
                  class="text-xs tabular-nums text-muted"
                  dateTime={entry.at}
                >
                  {formatAlertTime(entry.at)}
                </time>
                <div class="min-w-0">
                  <p class="text-sm font-semibold">{entry.title}</p>
                  <p class="text-xs text-muted">{entry.detail}</p>
                  <p class="mt-1 text-[10px] uppercase tracking-wide text-muted">
                    {entry.kind === 'gap' ? 'Evidence gap' : entry.kind}
                  </p>
                </div>
              </li>
            )}
          </For>
        </ol>
      </Show>
    </AlertPanel>
  );
}
