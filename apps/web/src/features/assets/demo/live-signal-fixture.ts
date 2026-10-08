import type {
  LiveSignalFrame,
  LiveSignalIdentity,
  LiveSignalObservation,
  LiveSignalScript,
} from '../model/live-signal';
import { getDemoInspector } from './inspector-fixture';

/**
 * Finite invented feed for an interaction preview, never a telemetry contract.
 * The virtual clock is part of the fixture; browser wall time cannot make
 * these 2026 readings appear fresh. Only development composition imports it.
 */
export const SAMPLE_LIVE_START_MS = Date.parse('2026-10-06T10:00:00Z');

function observation(
  signalId: string,
  sequence: string,
  value: number,
  unit: string,
  eventAt: string,
  receivedAt: string,
): LiveSignalObservation {
  return {
    signalId,
    sequence,
    value,
    unit,
    quality: 'good',
    eventAtMs: Date.parse(eventAt),
    receivedAtMs: Date.parse(receivedAt),
  };
}

const TEMPERATURE_ID = 'sample-signal-motor-temperature';
const POWER_ID = 'sample-signal-traction-power';

const RAIL_BEFORE_LOSS: readonly LiveSignalFrame[] = [
  {
    kind: 'snapshot',
    atMs: SAMPLE_LIVE_START_MS,
    observations: [
      observation(
        TEMPERATURE_ID,
        '1',
        69.4,
        '°C',
        '2026-10-06T09:58:00Z',
        '2026-10-06T09:58:30Z',
      ),
      observation(
        POWER_ID,
        '1',
        412,
        'kW',
        '2026-10-06T09:58:00Z',
        '2026-10-06T09:58:32Z',
      ),
    ],
  },
  {
    kind: 'observation',
    atMs: Date.parse('2026-10-06T10:00:20Z'),
    observation: observation(
      TEMPERATURE_ID,
      '2',
      70.1,
      '°C',
      '2026-10-06T10:00:15Z',
      '2026-10-06T10:00:18Z',
    ),
  },
  {
    kind: 'observation',
    atMs: Date.parse('2026-10-06T10:00:25Z'),
    observation: observation(
      TEMPERATURE_ID,
      '2',
      70.1,
      '°C',
      '2026-10-06T10:00:15Z',
      '2026-10-06T10:00:18Z',
    ),
  },
  {
    kind: 'observation',
    atMs: Date.parse('2026-10-06T10:00:30Z'),
    observation: observation(
      POWER_ID,
      '2',
      415,
      'kW',
      '2026-10-06T10:00:22Z',
      '2026-10-06T10:00:28Z',
    ),
  },
  {
    kind: 'observation',
    atMs: Date.parse('2026-10-06T10:00:35Z'),
    observation: observation(
      TEMPERATURE_ID,
      '4',
      70.8,
      '°C',
      '2026-10-06T10:00:30Z',
      '2026-10-06T10:00:34Z',
    ),
  },
];

const RAIL_AFTER_RECONNECT: readonly LiveSignalFrame[] = [
  {
    kind: 'snapshot',
    atMs: Date.parse('2026-10-06T10:01:02Z'),
    observations: [
      observation(
        TEMPERATURE_ID,
        '4',
        71,
        '°C',
        '2026-10-06T10:00:38Z',
        '2026-10-06T10:01:01Z',
      ),
      observation(
        POWER_ID,
        '2',
        415,
        'kW',
        '2026-10-06T10:00:22Z',
        '2026-10-06T10:00:28Z',
      ),
    ],
  },
  {
    kind: 'observation',
    atMs: Date.parse('2026-10-06T10:01:05Z'),
    observation: observation(
      TEMPERATURE_ID,
      '5',
      70.7,
      '°C',
      '2026-10-06T10:00:20Z',
      '2026-10-06T10:01:05Z',
    ),
  },
  { kind: 'tick', atMs: Date.parse('2026-10-06T10:04:10Z') },
];

function signalIdentities(assetId: string): readonly LiveSignalIdentity[] {
  const inspector = getDemoInspector('tenant-a', assetId);
  if (!inspector) return [];
  const targetId =
    assetId === 'asset-004' ? 'sample-motor-417' : 'sample-freezer-011';
  return inspector.signals
    .filter((signal) => signal.binding.targetAssetId === targetId)
    .map((signal) => ({ id: signal.id, unit: signal.unit }));
}

/** Unknown assets have no sample stream; the trailer has a known empty feed. */
export function getSampleSignalScenario(
  assetId: string,
): LiveSignalScript | null {
  if (assetId === 'asset-004') {
    return {
      startAtMs: SAMPLE_LIVE_START_MS,
      signals: signalIdentities(assetId),
      beforeLoss: RAIL_BEFORE_LOSS,
      lossAtMs: Date.parse('2026-10-06T10:00:40Z'),
      reconnectAtMs: [
        Date.parse('2026-10-06T10:00:55Z'),
        Date.parse('2026-10-06T10:01:00Z'),
      ],
      afterReconnect: RAIL_AFTER_RECONNECT,
    };
  }
  if (assetId === 'asset-008') {
    return {
      startAtMs: SAMPLE_LIVE_START_MS,
      signals: signalIdentities(assetId),
      beforeLoss: [
        { kind: 'snapshot', atMs: SAMPLE_LIVE_START_MS, observations: [] },
        { kind: 'tick', atMs: Date.parse('2026-10-06T10:04:10Z') },
      ],
      lossAtMs: null,
      reconnectAtMs: [],
      afterReconnect: [],
    };
  }
  return null;
}
