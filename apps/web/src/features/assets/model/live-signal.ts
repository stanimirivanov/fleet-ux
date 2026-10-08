/**
 * Transport-neutral projection of a finite signal feed.
 *
 * Sequence and event time answer different questions. A higher sequence can
 * carry a late event; that event advances deduplication without replacing the
 * latest event-time reading. A sequence gap suspends deltas until a snapshot.
 */
export type LiveSignalPhase =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'complete'
  | 'stopped'
  | 'failed';

export type LiveSignalFailure =
  | 'reconnect-exhausted'
  | 'invalid-script'
  | 'unexpected';

export type LiveSignalQuality = 'good' | 'suspect' | 'not-observed';
export type LiveSignalFreshness = 'missing' | 'fresh' | 'stale';
export type LiveSignalSync = 'in-sync' | 'resnapshot-required';

export interface LiveSignalIdentity {
  readonly id: string;
  readonly unit: string | null;
}

export interface LiveSignalObservation {
  readonly signalId: string;
  /** Decimal text avoids truncating a backend unsigned sequence. */
  readonly sequence: string;
  readonly value: number;
  readonly unit: string | null;
  readonly quality: Exclude<LiveSignalQuality, 'not-observed'>;
  readonly eventAtMs: number;
  readonly receivedAtMs: number;
}

export interface LiveSignalReading {
  readonly value: number | null;
  readonly unit: string | null;
  readonly eventAtMs: number | null;
  readonly receivedAtMs: number | null;
  readonly quality: LiveSignalQuality;
  readonly freshness: LiveSignalFreshness;
  readonly sync: LiveSignalSync;
  readonly sequence: string | null;
  readonly duplicateCount: number;
  readonly gapCount: number;
  /** A later-arriving old event was seen but did not replace the displayed value. */
  readonly lateArrival: boolean;
}

export interface LiveSignalState {
  readonly phase: LiveSignalPhase;
  readonly virtualNowMs: number;
  readonly readings: Readonly<Record<string, LiveSignalReading>>;
  readonly reconnectAttempt: number;
  readonly failure: LiveSignalFailure | null;
}

export type LiveSignalFrame =
  | { readonly kind: 'connecting'; readonly atMs: number }
  | {
      readonly kind: 'connected';
      readonly atMs: number;
      readonly attempt: number;
    }
  | {
      readonly kind: 'snapshot';
      readonly atMs: number;
      readonly observations: readonly LiveSignalObservation[];
    }
  | {
      readonly kind: 'observation';
      readonly atMs: number;
      readonly observation: LiveSignalObservation;
    }
  | { readonly kind: 'lost'; readonly atMs: number }
  | {
      readonly kind: 'reconnecting';
      readonly atMs: number;
      readonly attempt: number;
    }
  | { readonly kind: 'tick'; readonly atMs: number }
  | { readonly kind: 'complete'; readonly atMs: number }
  | { readonly kind: 'stopped'; readonly atMs: number }
  | {
      readonly kind: 'failed';
      readonly atMs: number;
      readonly failure: LiveSignalFailure;
    };

/** Deterministic transport input consumed by the scoped playback service. */
export interface LiveSignalScript {
  readonly startAtMs: number;
  readonly signals: readonly LiveSignalIdentity[];
  readonly beforeLoss: readonly LiveSignalFrame[];
  readonly lossAtMs: number | null;
  /** Bounded reconnection attempts; the second attempt succeeds in the demo. */
  readonly reconnectAtMs: readonly number[];
  readonly afterReconnect: readonly LiveSignalFrame[];
}
export const LIVE_FRESHNESS_LIMIT_MS = 180_000;

function freshness(
  eventAtMs: number | null,
  nowMs: number,
): LiveSignalFreshness {
  if (eventAtMs === null) return 'missing';
  return nowMs - eventAtMs <= LIVE_FRESHNESS_LIMIT_MS ? 'fresh' : 'stale';
}

function isSequence(value: string): boolean {
  return /^(0|[1-9][0-9]*)$/.test(value);
}

function invalid(state: LiveSignalState): LiveSignalState {
  return { ...state, phase: 'failed', failure: 'invalid-script' };
}

/** Create a missing-evidence state for explicitly registered signal identities. */
export function createLiveSignalState(
  signals: readonly LiveSignalIdentity[],
  virtualNowMs: number,
): LiveSignalState {
  const readings: Record<string, LiveSignalReading> = {};
  for (const signal of signals) {
    readings[signal.id] = {
      value: null,
      unit: signal.unit,
      eventAtMs: null,
      receivedAtMs: null,
      quality: 'not-observed',
      freshness: 'missing',
      sync: 'in-sync',
      sequence: null,
      duplicateCount: 0,
      gapCount: 0,
      lateArrival: false,
    };
  }
  return {
    phase: 'idle',
    virtualNowMs,
    readings,
    reconnectAttempt: 0,
    failure: null,
  };
}

function reclassify(
  readings: LiveSignalState['readings'],
  nowMs: number,
): LiveSignalState['readings'] {
  let next: Record<string, LiveSignalReading> | null = null;
  for (const [id, reading] of Object.entries(readings)) {
    const current = freshness(reading.eventAtMs, nowMs);
    if (current !== reading.freshness) {
      next ??= { ...readings };
      next[id] = { ...reading, freshness: current };
    }
  }
  return next ?? readings;
}

function applyObservation(
  state: LiveSignalState,
  observation: LiveSignalObservation,
  snapshot: boolean,
): LiveSignalState {
  const prior = state.readings[observation.signalId];
  if (
    !prior ||
    !isSequence(observation.sequence) ||
    !Number.isFinite(observation.value) ||
    !Number.isFinite(observation.eventAtMs) ||
    !Number.isFinite(observation.receivedAtMs) ||
    observation.eventAtMs > observation.receivedAtMs ||
    observation.receivedAtMs > state.virtualNowMs
  ) {
    return invalid(state);
  }

  const nextSequence = BigInt(observation.sequence);
  if (!snapshot && prior.sequence !== null) {
    const previousSequence = BigInt(prior.sequence);
    if (nextSequence <= previousSequence) {
      return {
        ...state,
        readings: {
          ...state.readings,
          [observation.signalId]: {
            ...prior,
            duplicateCount: prior.duplicateCount + 1,
          },
        },
      };
    }
    if (prior.sync === 'resnapshot-required') return state;
    if (nextSequence > previousSequence + 1n) {
      return {
        ...state,
        readings: {
          ...state.readings,
          [observation.signalId]: {
            ...prior,
            sync: 'resnapshot-required',
            gapCount: prior.gapCount + 1,
          },
        },
      };
    }
  }

  const lateArrival =
    !snapshot &&
    prior.eventAtMs !== null &&
    observation.eventAtMs < prior.eventAtMs;
  const reading: LiveSignalReading = lateArrival
    ? {
        ...prior,
        sequence: observation.sequence,
        lateArrival: true,
      }
    : {
        ...prior,
        value: observation.value,
        unit: observation.unit,
        quality: observation.quality,
        eventAtMs: observation.eventAtMs,
        receivedAtMs: observation.receivedAtMs,
        freshness: freshness(observation.eventAtMs, state.virtualNowMs),
        sync: 'in-sync',
        sequence: observation.sequence,
        lateArrival: false,
      };
  return {
    ...state,
    readings: { ...state.readings, [observation.signalId]: reading },
  };
}

/** Apply one validated feed frame without timers, transport, or Solid state. */
export function reduceLiveSignalState(
  state: LiveSignalState,
  frame: LiveSignalFrame,
): LiveSignalState {
  if (state.phase === 'stopped' || state.phase === 'failed') return state;
  if (!Number.isFinite(frame.atMs) || frame.atMs < state.virtualNowMs) {
    return invalid(state);
  }
  const now = frame.atMs;
  const advanced: LiveSignalState = {
    ...state,
    virtualNowMs: now,
    readings: reclassify(state.readings, now),
  };
  switch (frame.kind) {
    case 'connecting':
      return { ...advanced, phase: 'connecting', failure: null };
    case 'connected':
      return {
        ...advanced,
        phase: 'connected',
        reconnectAttempt: frame.attempt,
      };
    case 'snapshot': {
      // A snapshot is authoritative for this registered set. If a previously
      // observed source is absent, retain its identity but clear old evidence.
      const cleared: Record<string, LiveSignalReading> = {};
      for (const [id, reading] of Object.entries(advanced.readings)) {
        cleared[id] = {
          ...reading,
          value: null,
          eventAtMs: null,
          receivedAtMs: null,
          quality: 'not-observed',
          freshness: 'missing',
          sync: 'in-sync',
          sequence: null,
          lateArrival: false,
        };
      }
      let result: LiveSignalState = { ...advanced, readings: cleared };
      for (const observation of frame.observations) {
        result = applyObservation(result, observation, true);
        if (result.phase === 'failed') break;
      }
      return result;
    }
    case 'observation':
      return applyObservation(advanced, frame.observation, false);
    case 'lost':
      return { ...advanced, phase: 'reconnecting' };
    case 'reconnecting':
      return {
        ...advanced,
        phase: 'reconnecting',
        reconnectAttempt: frame.attempt,
      };
    case 'tick':
      return advanced;
    case 'complete':
      return { ...advanced, phase: 'complete' };
    case 'stopped':
      return { ...advanced, phase: 'stopped' };
    case 'failed':
      return { ...advanced, phase: 'failed', failure: frame.failure };
  }
}
