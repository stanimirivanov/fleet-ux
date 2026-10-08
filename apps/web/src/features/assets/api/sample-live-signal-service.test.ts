import { describe, expect, test } from 'vitest';
import type { LiveSignalState } from '../model/live-signal';
import {
  initialLiveSignalState,
  startSampleSignalPlayback,
} from './sample-live-signal-service';

const TEMPERATURE_ID = 'sample-signal-motor-temperature';
const POWER_ID = 'sample-signal-traction-power';
const FREEZER_ID = 'sample-signal-freezer-air';

function fastOptions() {
  return { stepDelayMs: 0, reconnectDelayMs: 0 };
}

describe('scoped sample signal playback', () => {
  test('publishes a bounded reconnect and authoritative resnapshot before late and stale evidence', async () => {
    const states: LiveSignalState[] = [];
    const handle = startSampleSignalPlayback(
      'asset-004',
      (state) => states.push(state),
      fastOptions(),
    );
    expect(handle).not.toBeNull();
    expect(states[0]?.phase).toBe('connecting');
    const final = await handle?.finished;
    expect(final?.phase).toBe('complete');
    expect(states.some((state) => state.phase === 'reconnecting')).toBe(true);
    expect(
      states.some(
        (state) =>
          state.phase === 'reconnecting' && state.reconnectAttempt === 1,
      ),
    ).toBe(true);
    expect(
      states.some(
        (state) => state.phase === 'connected' && state.reconnectAttempt === 2,
      ),
    ).toBe(true);
    expect(
      states.some(
        (state) =>
          state.readings[TEMPERATURE_ID]?.sync === 'resnapshot-required',
      ),
    ).toBe(true);
    expect(final?.readings[TEMPERATURE_ID]).toMatchObject({
      value: 71,
      sequence: '5',
      gapCount: 1,
      duplicateCount: 1,
      lateArrival: true,
      sync: 'in-sync',
      freshness: 'stale',
    });
    expect(final?.readings[POWER_ID]).toMatchObject({
      value: 415,
      freshness: 'stale',
    });
    expect(final?.failure).toBeNull();
  });

  test('a configured trailer signal stays missing through an empty stream', async () => {
    const initial = initialLiveSignalState('asset-008');
    expect(initial.readings[FREEZER_ID]).toMatchObject({
      value: null,
      freshness: 'missing',
    });
    const handle = startSampleSignalPlayback(
      'asset-008',
      () => {},
      fastOptions(),
    );
    const final = await handle?.finished;
    expect(final?.readings[FREEZER_ID]).toMatchObject({
      value: null,
      quality: 'not-observed',
      freshness: 'missing',
    });
    expect(startSampleSignalPlayback('unregistered', () => {})).toBeNull();
    expect(initialLiveSignalState('unregistered').readings).toEqual({});
  });

  test('exhausted bounded reconnect exposes a typed failure', async () => {
    const states: LiveSignalState[] = [];
    const handle = startSampleSignalPlayback(
      'asset-004',
      (state) => states.push(state),
      { ...fastOptions(), maxReconnectAttempts: 1 },
    );
    const final = await handle?.finished;
    expect(final).toMatchObject({
      phase: 'failed',
      reconnectAttempt: 1,
      failure: 'reconnect-exhausted',
    });
    expect(states.at(-1)).toBe(final);
  });

  test('stop is idempotent and prevents every later scheduled callback', async () => {
    const states: LiveSignalState[] = [];
    const handle = startSampleSignalPlayback(
      'asset-004',
      (state) => states.push(state),
      { stepDelayMs: 20, reconnectDelayMs: 20 },
    );
    expect(states).toHaveLength(1);
    handle?.stop();
    expect(states.at(-1)?.phase).toBe('stopped');
    const countAfterStop = states.length;
    handle?.stop();
    const final = await handle?.finished;
    expect(final?.phase).toBe('stopped');
    expect(states).toHaveLength(countAfterStop);
  });

  test('disposing an already complete or failed session preserves its terminal state', async () => {
    const completedStates: LiveSignalState[] = [];
    const completed = startSampleSignalPlayback(
      'asset-008',
      (state) => completedStates.push(state),
      fastOptions(),
    );
    const completeResult = await completed?.finished;
    const completedCount = completedStates.length;
    completed?.stop();
    expect(completeResult?.phase).toBe('complete');
    expect(completedStates).toHaveLength(completedCount);

    const failedStates: LiveSignalState[] = [];
    const failed = startSampleSignalPlayback(
      'asset-004',
      (state) => failedStates.push(state),
      { ...fastOptions(), maxReconnectAttempts: 0 },
    );
    const failedResult = await failed?.finished;
    const failedCount = failedStates.length;
    failed?.stop();
    expect(failedResult?.phase).toBe('failed');
    expect(failedStates).toHaveLength(failedCount);
  });
});
