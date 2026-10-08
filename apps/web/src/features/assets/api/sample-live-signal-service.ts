import { Effect, Fiber } from 'effect';
import {
  getSampleSignalScenario,
  SAMPLE_LIVE_START_MS,
} from '../demo/live-signal-fixture';
import {
  createLiveSignalState,
  type LiveSignalFrame,
  type LiveSignalScript,
  type LiveSignalState,
  reduceLiveSignalState,
} from '../model/live-signal';

export interface SampleSignalPlaybackOptions {
  /** Real delay between fixed virtual-time frames; zero makes tests deterministic. */
  readonly stepDelayMs?: number;
  readonly reconnectDelayMs?: number;
  /** The finite sample fails its first attempt and succeeds on the second. */
  readonly maxReconnectAttempts?: number;
}

export interface SampleSignalPlaybackHandle {
  /** Idempotently interrupts the owned fiber and publishes one terminal state. */
  readonly stop: () => void;
  /** Resolves with the terminal projection, including after interruption. */
  readonly finished: Promise<LiveSignalState>;
}

function nonnegativeDelay(input: number | undefined, fallback: number): number {
  return input !== undefined && Number.isFinite(input) && input >= 0
    ? input
    : fallback;
}

/** The preview's initial state carries known signal identities but no evidence. */
export function initialLiveSignalState(assetId: string): LiveSignalState {
  const script = getSampleSignalScenario(assetId);
  return createLiveSignalState(
    script?.signals ?? [],
    script?.startAtMs ?? SAMPLE_LIVE_START_MS,
  );
}

/**
 * Start one finite, explicitly synthetic Effect workflow.
 *
 * Its fiber belongs to the caller. Stop it when the Solid owner is disposed or
 * the selected asset changes. Reconnect is bounded; a snapshot, not a guessed
 * missing delta, restores confidence after a sequence gap.
 */
export function startSampleSignalPlayback(
  assetId: string,
  onUpdate: (state: LiveSignalState) => void,
  options: SampleSignalPlaybackOptions = {},
): SampleSignalPlaybackHandle | null {
  const script = getSampleSignalScenario(assetId);
  if (!script) return null;
  return startScript(script, onUpdate, options);
}

function startScript(
  script: LiveSignalScript,
  onUpdate: (state: LiveSignalState) => void,
  options: SampleSignalPlaybackOptions,
): SampleSignalPlaybackHandle {
  const stepDelayMs = nonnegativeDelay(options.stepDelayMs, 700);
  const reconnectDelayMs = nonnegativeDelay(options.reconnectDelayMs, 900);
  const maxReconnectAttempts =
    options.maxReconnectAttempts !== undefined &&
    Number.isInteger(options.maxReconnectAttempts)
      ? Math.max(
          0,
          Math.min(options.maxReconnectAttempts, script.reconnectAtMs.length),
        )
      : script.reconnectAtMs.length;
  const controller = new AbortController();
  let active = true;
  let current = createLiveSignalState(script.signals, script.startAtMs);

  const publish = (frame: LiveSignalFrame): void => {
    if (!active) return;
    current = reduceLiveSignalState(current, frame);
    onUpdate(current);
  };
  // Synchronous initial delivery lets the view show a trustworthy connecting
  // state before the first scheduled frame.
  publish({ kind: 'connecting', atMs: script.startAtMs });

  const program = Effect.gen(function* () {
    yield* Effect.sleep(stepDelayMs);
    publish({ kind: 'connected', atMs: script.startAtMs, attempt: 0 });

    for (const frame of script.beforeLoss) {
      yield* Effect.sleep(stepDelayMs);
      publish(frame);
      if (current.phase === 'failed') return;
    }

    if (script.lossAtMs !== null) {
      yield* Effect.sleep(stepDelayMs);
      publish({ kind: 'lost', atMs: script.lossAtMs });

      let reconnected = false;
      for (let index = 0; index < maxReconnectAttempts; index += 1) {
        yield* Effect.sleep(reconnectDelayMs);
        const atMs = script.reconnectAtMs[index];
        if (atMs === undefined) break;
        const attempt = index + 1;
        publish({ kind: 'reconnecting', atMs, attempt });
        if (attempt === script.reconnectAtMs.length) {
          publish({ kind: 'connected', atMs, attempt });
          reconnected = true;
          break;
        }
      }
      if (!reconnected) {
        publish({
          kind: 'failed',
          atMs: current.virtualNowMs,
          failure: 'reconnect-exhausted',
        });
        return;
      }

      for (const frame of script.afterReconnect) {
        yield* Effect.sleep(stepDelayMs);
        publish(frame);
        if (current.phase === 'failed') return;
      }
    }

    yield* Effect.sleep(stepDelayMs);
    publish({
      kind: 'complete',
      atMs: current.virtualNowMs,
    });
  });

  const fiber = Effect.runFork(program, { signal: controller.signal });
  const finished = Effect.runPromiseExit(Fiber.join(fiber)).then(() => {
    if (active && current.phase !== 'complete' && current.phase !== 'failed') {
      publish({
        kind: 'failed',
        atMs: current.virtualNowMs,
        failure: 'unexpected',
      });
    }
    return current;
  });

  return {
    stop: () => {
      if (!active || current.phase === 'complete' || current.phase === 'failed')
        return;
      active = false;
      controller.abort();
      current = reduceLiveSignalState(current, {
        kind: 'stopped',
        atMs: current.virtualNowMs,
      });
      onUpdate(current);
    },
    finished,
  };
}
