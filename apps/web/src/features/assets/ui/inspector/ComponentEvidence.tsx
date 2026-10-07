import { createMemo, For, Show } from 'solid-js';
import type {
  DemoInspector,
  DemoTopologyNode,
} from '../../demo/inspector-fixture';
import { SamplePanel } from '../overview/SamplePanel';
import { formatSampleTime } from './inspector-format';
import { SignalCard } from './SignalCard';
import { type HistoryWindow, SignalHistory } from './SignalHistory';

export type InspectorTab = 'overview' | 'details' | 'events';
const TABS: readonly { id: InspectorTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'events', label: 'Events' },
];

/** Selected-node overview, details, and event tabs share the same URL state. */
export function ComponentEvidence(props: {
  readonly inspector: DemoInspector;
  readonly node: DemoTopologyNode;
  readonly tab: InspectorTab;
  readonly onTabChange: (tab: InspectorTab) => void;
  readonly window: HistoryWindow;
  readonly onWindowChange: (window: HistoryWindow) => void;
}) {
  const signals = createMemo(() =>
    props.inspector.signals.filter(
      (signal) => signal.binding.targetAssetId === props.node.id,
    ),
  );
  const events = createMemo(() =>
    props.inspector.events.filter(
      (event) => event.targetAssetId === props.node.id,
    ),
  );
  const relationships = createMemo(() =>
    props.inspector.relationships.filter(
      (relation) => relation.targetAssetId === props.node.id,
    ),
  );
  const gaps = createMemo(() =>
    props.inspector.gaps.filter((gap) => gap.targetAssetId === props.node.id),
  );

  return (
    <SamplePanel
      title="Component evidence"
      description="Selected physical identity and attributed signals"
    >
      <div class="border-b border-outline px-4 pt-4 sm:px-5">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-wide text-accent">
              {props.node.kind === 'device'
                ? 'Communication device'
                : props.node.kind === 'asset'
                  ? 'Physical asset'
                  : 'Component'}
            </p>
            <h2 class="mt-1 text-xl font-semibold">{props.node.label}</h2>
            <p class="mt-1 font-mono text-[11px] text-muted">
              {props.node.id} · {props.node.typeLabel}
            </p>
          </div>
          <p class="rounded border border-outline bg-surface px-2 py-1 text-[11px] text-muted">
            {signals().length} attributed{' '}
            {signals().length === 1 ? 'signal' : 'signals'}
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Inspector sections"
          class="mt-4 flex gap-1 overflow-x-auto"
        >
          <For each={TABS}>
            {(tab) => (
              <button
                type="button"
                role="tab"
                id={`inspector-tab-${tab.id}`}
                aria-controls="inspector-tab-panel"
                aria-selected={props.tab === tab.id}
                onClick={() => props.onTabChange(tab.id)}
                class={
                  'min-h-9 border-b-2 px-3 text-xs font-semibold ' +
                  (props.tab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-foreground')
                }
              >
                {tab.label}
              </button>
            )}
          </For>
        </div>
      </div>
      <div
        id="inspector-tab-panel"
        role="tabpanel"
        aria-labelledby={`inspector-tab-${props.tab}`}
        class="min-w-0 p-4 sm:p-5"
      >
        <Show when={props.tab === 'overview'}>
          <Show
            when={signals().length > 0}
            fallback={
              <div
                role="status"
                class="rounded-lg border border-outline bg-surface p-5 text-sm text-muted"
              >
                No attributed readings for this selected identity in the sample
                snapshot. The topology remains available for inspection.
              </div>
            }
          >
            <div class="grid gap-2 sm:grid-cols-2">
              <For each={signals()}>
                {(signal) => (
                  <SignalCard
                    signal={signal}
                    sourceLabel={
                      props.inspector.nodes.find(
                        (node) => node.id === signal.source.deviceAssetId,
                      )?.label ?? signal.source.deviceAssetId
                    }
                  />
                )}
              </For>
            </div>
            <div class="mt-5 border-t border-outline pt-4">
              <SignalHistory
                signals={signals()}
                gaps={gaps()}
                asOf={props.inspector.asOf}
                window={props.window}
                onWindowChange={props.onWindowChange}
              />
            </div>
          </Show>
        </Show>
        <Show when={props.tab === 'details'}>
          <div class="grid gap-4 text-xs">
            <div>
              <h3 class="font-semibold">Physical relationship</h3>
              <Show
                when={relationships().length > 0}
                fallback={
                  <p class="mt-1 text-muted">This is the topology root.</p>
                }
              >
                <For each={relationships()}>
                  {(relation) => (
                    <dl class="mt-2 grid gap-1 rounded-lg border border-outline bg-surface p-3 sm:grid-cols-2">
                      <div>
                        <dt class="text-muted">Relationship</dt>
                        <dd>
                          {relation.typeLabel} · revision {relation.revision}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-muted">From asset</dt>
                        <dd class="break-all font-mono">
                          {relation.sourceAssetId}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-muted">Effective from</dt>
                        <dd>{formatSampleTime(relation.effectiveFrom)}</dd>
                      </div>
                      <div>
                        <dt class="text-muted">Recorded at</dt>
                        <dd>{formatSampleTime(relation.recordedAt)}</dd>
                      </div>
                    </dl>
                  )}
                </For>
              </Show>
            </div>
            <div>
              <h3 class="font-semibold">Semantic signal targets</h3>
              <Show
                when={signals().length > 0}
                fallback={
                  <p class="mt-1 text-muted">
                    No signal binding targets this identity.
                  </p>
                }
              >
                <ul class="mt-2 grid gap-2">
                  <For each={signals()}>
                    {(signal) => (
                      <li class="rounded-lg border border-outline bg-surface p-3">
                        <span class="font-semibold">{signal.label}</span>
                        <span class="ml-2 break-all font-mono text-muted">
                          {signal.binding.propertyId} v
                          {signal.binding.propertyVersion}
                        </span>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </div>
          </div>
        </Show>
        <Show when={props.tab === 'events'}>
          <Show
            when={events().length > 0}
            fallback={
              <p role="status" class="text-sm text-muted">
                No events target this identity in the sample snapshot.
              </p>
            }
          >
            <ol class="grid gap-2">
              <For each={events()}>
                {(event) => (
                  <li class="rounded-lg border border-outline bg-surface p-3">
                    <p class="text-[11px] text-muted">
                      {formatSampleTime(event.at)} · {event.kind}
                    </p>
                    <h3 class="mt-1 text-xs font-semibold">{event.title}</h3>
                    <p class="mt-1 text-xs text-muted">{event.summary}</p>
                  </li>
                )}
              </For>
            </ol>
          </Show>
        </Show>
      </div>
    </SamplePanel>
  );
}
