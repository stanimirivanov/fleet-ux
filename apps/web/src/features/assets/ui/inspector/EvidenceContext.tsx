import { createMemo, For, Show } from 'solid-js';
import type {
  DemoInspector,
  DemoTopologyNode,
} from '../../demo/inspector-fixture';
import { SamplePanel } from '../overview/SamplePanel';
import { formatSampleTime } from './inspector-format';

/** Source, attribution, and unresolved evidence remain inspectable beside readings. */
export function EvidenceContext(props: {
  readonly inspector: DemoInspector;
  readonly node: DemoTopologyNode;
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
  const gaps = createMemo(() =>
    props.inspector.gaps.filter((gap) => gap.targetAssetId === props.node.id),
  );
  const sourceName = (deviceAssetId: string) =>
    props.inspector.nodes.find((node) => node.id === deviceAssetId)?.label ??
    deviceAssetId;

  return (
    <SamplePanel
      title="Evidence and context"
      description="Attribution, timing, and unresolved data"
    >
      <div class="grid gap-4 p-4 text-xs sm:p-5">
        <section>
          <h3 class="font-semibold">Recent evidence</h3>
          <Show
            when={events().length > 0}
            fallback={
              <p class="mt-2 text-muted">
                No event targets this selection at the sample cutoff.
              </p>
            }
          >
            <ol class="mt-2 border-l-2 border-outline pl-3">
              <For each={events()}>
                {(event) => (
                  <li class="relative pb-3 last:pb-0">
                    <span
                      aria-hidden="true"
                      class="absolute -left-[18px] top-1 size-2 rounded-full border border-accent bg-surface"
                    />
                    <p class="text-[11px] text-muted">
                      {formatSampleTime(event.at)}
                    </p>
                    <p class="mt-0.5 font-semibold">{event.title}</p>
                    <p class="mt-0.5 text-muted">{event.summary}</p>
                  </li>
                )}
              </For>
            </ol>
          </Show>
          <For each={gaps()}>
            {(gap) => (
              <p class="mt-2 rounded-md border border-status-warning/30 bg-status-warning/5 p-2 text-status-warning">
                Evidence gap · {gap.summary}
              </p>
            )}
          </For>
        </section>
        <section class="border-t border-outline pt-4">
          <h3 class="font-semibold">Data provenance</h3>
          <Show
            when={signals().length > 0}
            fallback={
              <p class="mt-2 text-muted">
                No attributed signal source is available for this selection.
              </p>
            }
          >
            <div class="mt-2 grid gap-2">
              <For each={signals()}>
                {(signal) => (
                  <dl class="grid gap-1.5 rounded-md border border-outline bg-surface p-3">
                    <div class="font-semibold">{signal.label}</div>
                    <div>
                      <dt class="inline text-muted">Source device · </dt>
                      <dd class="inline">
                        {sourceName(signal.source.deviceAssetId)}
                      </dd>
                    </div>
                    <div>
                      <dt class="inline text-muted">Endpoint · </dt>
                      <dd class="inline font-mono">
                        {signal.source.endpointId}
                      </dd>
                    </div>
                    <div>
                      <dt class="inline text-muted">Decoded signal · </dt>
                      <dd class="inline break-all font-mono">
                        {signal.source.signalId}
                      </dd>
                    </div>
                    <div>
                      <dt class="inline text-muted">Protocol package · </dt>
                      <dd class="inline break-all font-mono">
                        {signal.source.protocolPackageId}
                      </dd>
                    </div>
                    <div>
                      <dt class="inline text-muted">Binding · </dt>
                      <dd class="inline font-mono">
                        {signal.binding.id} · revision {signal.binding.revision}
                      </dd>
                    </div>
                    <div>
                      <dt class="inline text-muted">Target property · </dt>
                      <dd class="inline break-all font-mono">
                        {signal.binding.propertyId} v
                        {signal.binding.propertyVersion}
                      </dd>
                    </div>
                    <div>
                      <dt class="inline text-muted">Effective from · </dt>
                      <dd class="inline">
                        {formatSampleTime(signal.binding.effectiveFrom)}
                      </dd>
                    </div>
                    <div>
                      <dt class="inline text-muted">Recorded at · </dt>
                      <dd class="inline">
                        {formatSampleTime(signal.binding.recordedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt class="inline text-muted">Event / received · </dt>
                      <dd class="inline">
                        {formatSampleTime(signal.eventAt)} /{' '}
                        {formatSampleTime(signal.receivedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt class="inline text-muted">Quality · </dt>
                      <dd class="inline">{signal.quality.replace('-', ' ')}</dd>
                    </div>
                  </dl>
                )}
              </For>
            </div>
          </Show>
        </section>
        <section class="border-t border-outline pt-4">
          <h3 class="font-semibold">Unassigned signals</h3>
          <Show
            when={props.inspector.unattributed.length > 0}
            fallback={
              <p class="mt-2 text-muted">
                No unmatched sample signals at this cutoff.
              </p>
            }
          >
            <div class="mt-2 rounded-md border border-status-warning/30 bg-status-warning/5 p-3">
              <p class="font-semibold text-status-warning">
                {props.inspector.unattributed.length} signal needs attribution
              </p>
              <For each={props.inspector.unattributed}>
                {(unattributed) => (
                  <p class="mt-1 break-all text-muted">
                    {unattributed.source.signalId} · {unattributed.reason}
                  </p>
                )}
              </For>
            </div>
          </Show>
        </section>
      </div>
    </SamplePanel>
  );
}
