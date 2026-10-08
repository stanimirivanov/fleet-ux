import { cleanup, render, screen, within } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test } from 'vitest';
import { getDemoAlertTriage } from '../demo/alert-fixture';
import { AlertTrend } from './AlertTrend';

afterEach(cleanup);

test('trend exposes chart and a table where null observations remain gaps', async () => {
  const scene = getDemoAlertTriage('tenant-a');
  const evidence = scene.alerts
    .flatMap((alert) => alert.evidence)
    .find(
      (candidate) =>
        candidate.series.some((point) => point.value === null) &&
        candidate.series.some((point) => point.value !== null),
    );
  if (!evidence) throw new Error('Gap fixture missing');
  const user = userEvent.setup();
  render(() => <AlertTrend evidence={evidence} />);
  const trend = screen.getByRole('region', { name: 'Evidence trend' });
  expect(
    within(trend).getByRole('img', {
      name: `Sample evidence trend for ${evidence.label}; table follows`,
    }),
  ).toBeTruthy();
  await user.click(within(trend).getByText('View readings as a table'));
  const table = within(trend).getByRole('table', {
    name: `Sample evidence readings for ${evidence.label}`,
  });
  expect(within(table).getByText('Gap')).toBeTruthy();
  expect(within(table).queryByText(`0 ${evidence.unit}`)).toBeNull();
});
