import type { Page, TestInfo } from '@playwright/test';

/** Review artifacts record actual browser rendering; they are not visual baselines. */
export async function captureWorkspaceEvidence(
  page: Page,
  testInfo: TestInfo,
  name: string,
): Promise<void> {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}
