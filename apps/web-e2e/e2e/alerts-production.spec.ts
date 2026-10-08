import { expect, test } from '@playwright/test';
import { AlertsPage } from '../pages/alerts.page';

test('production Alerts route cannot activate synthetic incidents', async ({
  page,
}) => {
  const alerts = new AlertsPage(page);
  await page.goto('/alerts?preview=sample');

  await expect(alerts.heading).toBeVisible();
  await expect(alerts.connectionNotice).toBeVisible();
  await expect(alerts.connectionNotice).toContainText(
    'Alert lifecycle, evidence reads, and browser-safe identity',
  );
  await expect(alerts.queue).toHaveCount(0);
  await expect(alerts.selectedEvidence).toHaveCount(0);
  await expect(page.getByRole('banner')).toContainText(
    'Data source unconfigured',
  );

  await page.goto('/alerts');
  await expect(alerts.connectionNotice).toBeVisible();
  await expect(alerts.alertList).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'View sample alerts' }),
  ).toHaveCount(0);
});
