import { createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
import {
  initialLiveSignalState,
  startSampleSignalPlayback,
} from '../../api/sample-live-signal-service';
import type { DemoSignal } from '../../demo/inspector-fixture';
import type { LiveSignalState } from '../../model/live-signal';
import { LiveSignalReadingCard } from './LiveSignalReadingCard';

function phaseLabel(phase: LiveSignalState['phase']): string {
  switch (phase) {
    case 'idle':
      return 'Ready to play';
    case 'connecting':
      return 'Connecting to sample stream';
    case 'connected':
      return 'Playing';
    case 'reconnecting':
      return 'Reconnecting to sample stream';
    case 'complete':
      return 'Playback complete';
    case 'stopped':
      return 'Playback stopped';
    case 'failed':
      return 'Playback unavailable';
  }
}

function utcTime(value: number): string {
  return new Date(value)
    .toISOString()
    .replace('T', ' ')
    .replace('.000Z', ' UTC');
}

/** Local, deterministic playback UI. The fixed snapshot beside it never mutates. */
export function LiveSignalPreview(props: {
  readonly assetId: string;
  readonly signals: readonly DemoSignal[];
}) {
  const [state, setState] = createSignal(initialLiveSignalState(props.assetId));
  const [unavailable, setUnavailable] = createSignal(false);
  const playableSignals = createMemo(() => {
    const available = initialLiveSignalState(props.assetId).readings;
    return props.signals.filter((signal) => available[signal.id] !== undefined);
  });
  const awaitingResnapshot = createMemo(() =>
    playableSignals().some(
      (signal) => state().readings[signal.id]?.sync === 'resnapshot-required',
    ),
  );
  const recovery = createMemo(() => {
    if (playableSignals().length === 0) return 'Not applicable';
    if (awaitingResnapshot()) return 'Resnapshot required';
    if (state().phase === 'idle' || state().phase === 'connecting')
      return 'Awaiting first snapshot';
    if (state().phase === 'reconnecting') return 'Waiting to reconnect';
    return playableSignals().some(
      (signal) => typeof state().readings[signal.id]?.sequence === 'string',
    )
      ? 'In sync'
      : 'No observed signal';
  });
  const freshnessSummary = createMemo(() => {
    if (playableSignals().length === 0) return 'Not applicable';
    const counts = { fresh: 0, stale: 0, missing: 0 };
    for (const signal of playableSignals()) {
      const freshness = state().readings[signal.id]?.freshness ?? 'missing';
      counts[freshness] += 1;
    }
    return `${counts.fresh} fresh · ${counts.stale} stale · ${counts.missing} missing`;
  });
  const active = () =>
    state().phase === 'connecting' ||
    state().phase === 'connected' ||
    state().phase === 'reconnecting';
  let playback: { stop(): void } | null = null;
  let disposed = false;

  const begin = () => {
    if (playableSignals().length === 0) return;
    playback?.stop();
    playback = null;
    setState(initialLiveSignalState(props.assetId));
    setUnavailable(false);
    playback = startSampleSignalPlayback(props.assetId, (next) => {
      if (!disposed) setState(next);
    });
    if (!playback) setUnavailable(true);
  };
  const stop = () => {
    playback?.stop();
    playback = null;
  };
  onCleanup(() => {
    disposed = true;
    stop();
  });

  return (
    <section
      aria-label="Synthetic signal playback"
      class="min-w-0 rounded-lg border border-sample-outline bg-sample-surface p-3 sm:p-4"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-accent">
            Sample data · simulation
          </p>
          <h3 class="mt-1 text-sm font-semibold">Signal playback</h3>
          <p class="mt-1 text-xs text-muted">
            Rehearse stream recovery for this component with invented events.
            Fixed snapshot and history remain unchanged.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={
              playableSignals().length === 0 ||
              active() ||
              state().phase === 'complete' ||
              unavailable()
            }
            onClick={begin}
            class="rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-semibold text-canvas disabled:cursor-not-allowed disabled:opacity-50"
          >
            Play
          </button>
          <button
            type="button"
            disabled={!active()}
            onClick={stop}
            class="rounded-md border border-outline bg-surface px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Stop
          </button>
          <button
            type="button"
            disabled={playableSignals().length === 0 || unavailable()}
            onClick={begin}
            class="rounded-md border border-outline bg-surface px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Replay
          </button>
        </div>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-outline pt-3 text-xs text-muted">
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          class="flex flex-wrap gap-x-4 gap-y-1"
        >
          <span>
            Connection:{' '}
            {playableSignals().length === 0
              ? 'No sample scenario for this component'
              : phaseLabel(state().phase)}
          </span>
          <span>Recovery: {recovery()}</span>
          <span>Freshness: {freshnessSummary()}</span>
        </p>
        <p>Sample clock: {utcTime(state().virtualNowMs)}</p>
      </div>
      <Show when={unavailable() || state().failure !== null}>
        <p
          role="alert"
          class="mt-3 rounded-md border border-status-warning/30 bg-status-warning/5 p-2 text-xs text-status-warning"
        >
          {unavailable()
            ? 'No sample stream is available for this asset.'
            : 'Sample playback failed. The last trusted values remain visible; replay to try again.'}
        </p>
      </Show>
      <Show when={playableSignals().length === 0}>
        <p class="mt-3 text-xs text-muted">
          No synthetic playback frames cover this selected component.
        </p>
      </Show>
      <div class="mt-3 grid gap-2 lg:grid-cols-2">
        <For each={playableSignals()}>
          {(signal) => (
            <LiveSignalReadingCard
              signal={signal}
              reading={state().readings[signal.id]}
            />
          )}
        </For>
      </div>
    </section>
  );
}
