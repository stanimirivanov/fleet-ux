import { cleanup, render, screen, within } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { getDemoAlertTriage } from '../demo/alert-fixture';
import { DEFAULT_ALERT_QUERY } from '../model/alert-triage';
import { AlertQueue } from './AlertQueue';

afterEach(cleanup);

test('the sample queue is keyboard-operable and keeps severity distinct from review state', async () => {
  const user = userEvent.setup();
  const scene = getDemoAlertTriage('tenant-a');
  const first = scene.alerts[0];
  if (!first) throw new Error('Sample alert missing');
  const onSelect = vi.fn();
  const onSearch = vi.fn();
  const onSeverity = vi.fn();
  const onState = vi.fn();
  render(() => (
    <AlertQueue
      allCount={scene.alerts.length}
      alerts={scene.alerts}
      query={DEFAULT_ALERT_QUERY}
      selectedId={first.id}
      asOf={scene.asOf}
      onSearch={onSearch}
      onSeverity={onSeverity}
      onState={onState}
      onClear={() => undefined}
      onSelect={onSelect}
    />
  ));

  const queue = screen.getByRole('region', {
    name: `Alert queue (${scene.alerts.length})`,
  });
  expect(within(queue).getByText('Sample data')).toBeTruthy();
  expect(
    within(queue)
      .getByRole('button', {
        name: `Inspect ${first.title} on ${first.assetLabel}`,
      })
      .getAttribute('aria-current'),
  ).toBe('true');
  await user.type(
    within(queue).getByRole('searchbox', { name: 'Search alerts' }),
    'motor',
  );
  expect(onSearch).toHaveBeenCalled();
  await user.selectOptions(
    within(queue).getByLabelText('Severity'),
    'critical',
  );
  expect(onSeverity).toHaveBeenCalledWith('critical');
  await user.selectOptions(
    within(queue).getByLabelText('Review state'),
    'open',
  );
  expect(onState).toHaveBeenCalledWith('open');
  const second = scene.alerts[1];
  if (!second) throw new Error('Second sample alert missing');
  await user.click(
    within(queue).getByRole('button', {
      name: `Inspect ${second.title} on ${second.assetLabel}`,
    }),
  );
  expect(onSelect).toHaveBeenCalledWith(second.id);
});

test('empty queue explains filter result and offers recovery', async () => {
  const onClear = vi.fn();
  const user = userEvent.setup();
  render(() => (
    <AlertQueue
      allCount={6}
      alerts={[]}
      query={{ ...DEFAULT_ALERT_QUERY, search: 'no-match' }}
      selectedId={null}
      asOf="2026-10-06T10:00:00Z"
      onSearch={() => undefined}
      onSeverity={() => undefined}
      onState={() => undefined}
      onClear={onClear}
      onSelect={() => undefined}
    />
  ));
  expect(
    screen.getByText('No sample alerts match these filters.'),
  ).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(onClear).toHaveBeenCalledTimes(1);
});
