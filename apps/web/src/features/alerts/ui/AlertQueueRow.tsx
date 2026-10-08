import { Show } from 'solid-js';
import { StatusBadge } from '#shared/ui';
import type { AlertRecord } from '../model/alert-triage';
import {
  formatAlertAge,
  formatAlertSeverity,
  formatAlertState,
} from './alert-format';

/** A native button keeps the queue stable and keyboard traversable. */
export function AlertQueueRow(props: {
  readonly alert: AlertRecord;
  readonly selected: boolean;
  readonly asOf: string;
  readonly onSelect: (id: string) => void;
}) {
  const tone = () =>
    props.alert.severity === 'critical'
      ? 'critical'
      : props.alert.severity === 'attention'
        ? 'warning'
        : 'unknown';
  return (
    <li class="border-t border-outline first:border-t-0">
      <button
        type="button"
        aria-current={props.selected ? 'true' : undefined}
        aria-label={`Inspect ${props.alert.title} on ${props.alert.assetLabel}`}
        onClick={() => props.onSelect(props.alert.id)}
        class={
          'grid w-full min-w-0 gap-2 px-4 py-3 text-left hover:bg-canvas/80 sm:px-5 ' +
          (props.selected
            ? 'border-l-[3px] border-accent bg-accent/5 pl-[13px] sm:pl-[17px]'
            : '')
        }
      >
        <div class="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <StatusBadge
            label={formatAlertSeverity(props.alert.severity)}
            tone={tone()}
          />
          <span class="text-[11px] tabular-nums text-muted">
            {formatAlertAge(props.alert.lastSeen, props.asOf)} ago
          </span>
        </div>
        <span class="min-w-0 text-sm font-semibold leading-snug">
          {props.alert.title}
        </span>
        <span class="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted">
          <span class="min-w-0 truncate">
            {props.alert.assetLabel} · {props.alert.componentLabel}
          </span>
          <span>{formatAlertState(props.alert.state)}</span>
        </span>
      </button>
      <Show when={props.selected}>
        <a
          href="#alert-evidence"
          class="block border-t border-outline px-4 py-2 text-xs font-semibold text-accent underline xl:hidden"
        >
          View selected evidence
        </a>
      </Show>
    </li>
  );
}
