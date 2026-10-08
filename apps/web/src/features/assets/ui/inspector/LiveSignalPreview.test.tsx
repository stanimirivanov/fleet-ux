import { cleanup, render, screen, within } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { createSignal } from 'solid-js';
import { afterEach, expect, test, vi } from 'vitest';
import {
  initialLiveSignalState,
  startSampleSignalPlayback,
} from '../../api/sample-live-signal-service';
import {
  type DemoTopologyNode,
  getDemoInspector,
} from '../../demo/inspector-fixture';
import type { LiveSignalState } from '../../model/live-signal';
import { ComponentEvidence, type InspectorTab } from './ComponentEvidence';
import { LiveSignalPreview } from './LiveSignalPreview';

vi.mock('../../api/sample-live-signal-service', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../api/sample-live-signal-service')
    >();
  return { ...actual, startSampleSignalPlayback: vi.fn() };
});

const ASSET_ID = 'asset-004';
const MOTOR_ID = 'sample-motor-417';
const BMS_ID = 'sample-bms-417';
const SIGNAL_ID = 'sample-signal-motor-temperature';

function scene() {
  const inspector = getDemoInspector('tenant-a', ASSET_ID);
  if (!inspector) throw new Error('Rail inspector fixture missing');
  return inspector;
}

function node(id: string): DemoTopologyNode {
  const found = scene().nodes.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Sample node ${id} missing`);
  return found;
}

function mockPlayback() {
  const sessions: {
    readonly emit: (state: LiveSignalState) => void;
    readonly stop: ReturnType<typeof vi.fn>;
  }[] = [];
  vi.mocked(startSampleSignalPlayback).mockImplementation(
    (assetId, onUpdate) => {
      const initial = initialLiveSignalState(assetId);
      const connecting: LiveSignalState = { ...initial, phase: 'connecting' };
      let current = connecting;
      const emit = (next: LiveSignalState) => {
        current = next;
        onUpdate(next);
      };
      emit(connecting);
      const stop = vi.fn(() => emit({ ...current, phase: 'stopped' }));
      sessions.push({ emit, stop });
      return { stop, finished: Promise.resolve(connecting) };
    },
  );
  return sessions;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test('playback controls show separate evidence and retain the last value when stopped', async () => {
  const sessions = mockPlayback();
  const user = userEvent.setup();
  const signal = scene().signals.find(
    (candidate) => candidate.id === SIGNAL_ID,
  );
  if (!signal) throw new Error('Motor signal missing');
  render(() => <LiveSignalPreview assetId={ASSET_ID} signals={[signal]} />);
  const panel = screen.getByRole('region', {
    name: 'Synthetic signal playback',
  });
  expect(within(panel).getByRole('status').textContent).toContain(
    'Ready to play',
  );
  expect(within(panel).getByText('No played observation')).toBeTruthy();
  expect(
    within(panel).getByText('Recovery: Awaiting first snapshot'),
  ).toBeTruthy();
  expect(within(panel).getAllByRole('status')).toHaveLength(1);
  expect(within(panel).getByRole('status').textContent).toContain(
    'Freshness: 0 fresh · 0 stale · 1 missing',
  );
  expect(within(panel).getByRole('status').textContent).not.toContain(
    'Sample clock',
  );

  await user.click(within(panel).getByRole('button', { name: 'Play' }));
  expect(startSampleSignalPlayback).toHaveBeenCalledWith(
    ASSET_ID,
    expect.any(Function),
  );
  expect(within(panel).getByRole('status').textContent).toContain('Connecting');
  const initial = initialLiveSignalState(ASSET_ID);
  const before = initial.readings[SIGNAL_ID];
  if (!before || !sessions[0]) throw new Error('Playback fixture missing');
  const played: LiveSignalState = {
    ...initial,
    phase: 'connected',
    readings: {
      ...initial.readings,
      [SIGNAL_ID]: {
        ...before,
        value: 70.1,
        eventAtMs: Date.parse('2026-10-06T10:00:15Z'),
        receivedAtMs: Date.parse('2026-10-06T10:00:18Z'),
        sequence: '2',
        freshness: 'fresh',
        quality: 'good',
      },
    },
  };
  sessions[0].emit(played);
  expect(within(panel).getByText('70.1')).toBeTruthy();
  expect(
    within(panel).getByText(/Freshness ·/).parentElement?.textContent,
  ).toContain('fresh');
  expect(within(panel).getByRole('status').textContent).toContain('Playing');
  expect(within(panel).getByRole('status').textContent).toContain(
    'Freshness: 1 fresh · 0 stale · 0 missing',
  );
  const trusted = played.readings[SIGNAL_ID];
  if (!trusted) throw new Error('Played reading missing');
  sessions[0].emit({
    ...played,
    readings: {
      ...played.readings,
      [SIGNAL_ID]: {
        ...trusted,
        freshness: 'stale',
        sync: 'resnapshot-required',
        gapCount: 1,
      },
    },
  });
  const announcement = within(panel).getByRole('status');
  expect(announcement.textContent).toContain('Recovery: Resnapshot required');
  expect(announcement.textContent).toContain(
    'Freshness: 0 fresh · 1 stale · 0 missing',
  );
  expect(announcement.textContent).not.toContain('Sample clock');
  expect(within(panel).getAllByRole('status')).toHaveLength(1);
  await user.click(within(panel).getByRole('button', { name: 'Stop' }));
  expect(sessions[0].stop).toHaveBeenCalledTimes(1);
  expect(within(panel).getByRole('status').textContent).toContain(
    'Playback stopped',
  );
  // The mock stops the transport; the component does not erase its last trusted reading.
  expect(within(panel).getByText('70.1')).toBeTruthy();

  await user.click(within(panel).getByRole('button', { name: 'Replay' }));
  expect(startSampleSignalPlayback).toHaveBeenCalledTimes(2);
  expect(within(panel).getByText('No played observation')).toBeTruthy();
  expect(
    within(panel).getByText('Recovery: Awaiting first snapshot'),
  ).toBeTruthy();
  cleanup();
  expect(sessions[1]?.stop).toHaveBeenCalledTimes(1);
});

test('selected component and tab changes dispose the previous playback scope', async () => {
  const sessions = mockPlayback();
  const user = userEvent.setup();
  const inspector = scene();
  const [selected, setSelected] = createSignal(node(MOTOR_ID));
  const [tab, setTab] = createSignal<InspectorTab>('overview');
  render(() => (
    <ComponentEvidence
      inspector={inspector}
      node={selected()}
      tab={tab()}
      onTabChange={setTab}
      window="6h"
      onWindowChange={() => undefined}
    />
  ));
  await user.click(screen.getByRole('button', { name: 'Play' }));
  expect(sessions).toHaveLength(1);
  setSelected(node(BMS_ID));
  expect(sessions[0]?.stop).toHaveBeenCalledTimes(1);
  const unsupported = screen.getByRole('region', {
    name: 'Synthetic signal playback',
  });
  expect(within(unsupported).getByRole('status').textContent).toContain(
    'No sample scenario',
  );
  expect(
    within(unsupported)
      .getByRole('button', { name: 'Play' })
      .hasAttribute('disabled'),
  ).toBe(true);
  expect(
    within(unsupported).getByText(
      'No synthetic playback frames cover this selected component.',
    ),
  ).toBeTruthy();
  setSelected(node(MOTOR_ID));
  expect(screen.getByRole('status').textContent).toContain('Ready to play');
  await user.click(screen.getByRole('button', { name: 'Play' }));
  expect(sessions).toHaveLength(2);
  setTab('details');
  expect(sessions[1]?.stop).toHaveBeenCalledTimes(1);
  expect(
    screen.queryByRole('region', { name: 'Synthetic signal playback' }),
  ).toBeNull();
});
