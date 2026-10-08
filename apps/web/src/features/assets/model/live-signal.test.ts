import { describe, expect, test } from 'vitest';
import {
  createLiveSignalState,
  type LiveSignalObservation,
  reduceLiveSignalState,
} from './live-signal';

const START = Date.parse('2026-10-06T10:00:00Z');
const SIGNAL = 'motor.temperature';

function observation(
  sequence: string,
  value: number,
  eventOffsetMs: number,
  receiveOffsetMs: number,
): LiveSignalObservation {
  return {
    signalId: SIGNAL,
    sequence,
    value,
    unit: '°C',
    quality: 'good',
    eventAtMs: START + eventOffsetMs,
    receivedAtMs: START + receiveOffsetMs,
  };
}

describe('live signal projection', () => {
  test('keeps missing evidence distinct from zero and uses virtual event time for freshness', () => {
    const initial = createLiveSignalState([{ id: SIGNAL, unit: '°C' }], START);
    expect(initial.readings[SIGNAL]).toMatchObject({
      value: null,
      quality: 'not-observed',
      freshness: 'missing',
      sequence: null,
    });
    const snapshot = reduceLiveSignalState(initial, {
      kind: 'snapshot',
      atMs: START,
      observations: [observation('1', 0, -120_000, -110_000)],
    });
    expect(snapshot.readings[SIGNAL]).toMatchObject({
      value: 0,
      freshness: 'fresh',
      quality: 'good',
    });
    const stale = reduceLiveSignalState(snapshot, {
      kind: 'tick',
      atMs: START + 61_000,
    });
    expect(stale.readings[SIGNAL]).toMatchObject({
      value: 0,
      freshness: 'stale',
      quality: 'good',
    });
    expect(initial.readings[SIGNAL]?.value).toBeNull();
  });

  test('deduplicates decimal-text sequences, exposes gaps, and needs a resnapshot', () => {
    let state = createLiveSignalState([{ id: SIGNAL, unit: '°C' }], START);
    state = reduceLiveSignalState(state, {
      kind: 'snapshot',
      atMs: START,
      observations: [observation('18446744073709551613', 69, -20_000, -10_000)],
    });
    state = reduceLiveSignalState(state, {
      kind: 'observation',
      atMs: START + 20_000,
      observation: observation('18446744073709551614', 70, 15_000, 18_000),
    });
    state = reduceLiveSignalState(state, {
      kind: 'observation',
      atMs: START + 21_000,
      observation: observation('18446744073709551614', 999, 16_000, 19_000),
    });
    expect(state.readings[SIGNAL]).toMatchObject({
      value: 70,
      duplicateCount: 1,
      sequence: '18446744073709551614',
    });
    state = reduceLiveSignalState(state, {
      kind: 'observation',
      atMs: START + 30_000,
      observation: observation('18446744073709551616', 72, 25_000, 28_000),
    });
    expect(state.readings[SIGNAL]).toMatchObject({
      value: 70,
      sync: 'resnapshot-required',
      gapCount: 1,
    });
    state = reduceLiveSignalState(state, {
      kind: 'observation',
      atMs: START + 35_000,
      observation: observation('18446744073709551615', 71, 30_000, 34_000),
    });
    expect(state.readings[SIGNAL]?.value).toBe(70);
    state = reduceLiveSignalState(state, {
      kind: 'snapshot',
      atMs: START + 40_000,
      observations: [observation('18446744073709551616', 72, 32_000, 38_000)],
    });
    expect(state.readings[SIGNAL]).toMatchObject({
      value: 72,
      sync: 'in-sync',
      gapCount: 1,
    });
  });

  test('a later-received old event advances sequence without regressing displayed evidence', () => {
    let state = createLiveSignalState([{ id: SIGNAL, unit: '°C' }], START);
    state = reduceLiveSignalState(state, {
      kind: 'snapshot',
      atMs: START,
      observations: [observation('4', 71, -10_000, -1_000)],
    });
    state = reduceLiveSignalState(state, {
      kind: 'observation',
      atMs: START + 5_000,
      observation: observation('5', 70, -20_000, 5_000),
    });
    expect(state.readings[SIGNAL]).toMatchObject({
      value: 71,
      sequence: '5',
      eventAtMs: START - 10_000,
      receivedAtMs: START - 1_000,
      lateArrival: true,
    });
    expect(state.readings[SIGNAL]?.freshness).toBe('fresh');
  });

  test('invalid frames fail explicitly and terminal states reject later updates', () => {
    const initial = createLiveSignalState([{ id: SIGNAL, unit: '°C' }], START);
    const invalid = reduceLiveSignalState(initial, {
      kind: 'observation',
      atMs: START,
      observation: observation('01', 4, -1_000, -500),
    });
    expect(invalid).toMatchObject({
      phase: 'failed',
      failure: 'invalid-script',
    });
    expect(
      reduceLiveSignalState(invalid, {
        kind: 'tick',
        atMs: START + 2_000,
      }),
    ).toBe(invalid);
  });

  test('an authoritative snapshot clears a registered source it omits', () => {
    const other = 'motor.power';
    let state = createLiveSignalState(
      [
        { id: SIGNAL, unit: '°C' },
        { id: other, unit: 'kW' },
      ],
      START,
    );
    state = reduceLiveSignalState(state, {
      kind: 'snapshot',
      atMs: START,
      observations: [
        observation('1', 69, -10_000, -1_000),
        {
          signalId: other,
          sequence: '1',
          value: 415,
          unit: 'kW',
          quality: 'good',
          eventAtMs: START - 10_000,
          receivedAtMs: START - 1_000,
        },
      ],
    });
    state = reduceLiveSignalState(state, {
      kind: 'snapshot',
      atMs: START + 10_000,
      observations: [observation('2', 70, 5_000, 8_000)],
    });
    expect(state.readings[other]).toMatchObject({
      value: null,
      quality: 'not-observed',
      freshness: 'missing',
      sequence: null,
    });
    expect(state.readings[SIGNAL]?.value).toBe(70);
  });
});
