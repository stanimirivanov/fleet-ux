import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const baseURL = 'http://127.0.0.1:5173';

/** Development-only preview checks run against Vite's dev server. */
export default defineConfig({
  testDir: './e2e-dev',
  outputDir: fileURLToPath(
    new URL('../../test-results/development/', import.meta.url),
  ),
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: fileURLToPath(
          new URL('../../playwright-report/development/', import.meta.url),
        ),
      },
    ],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    colorScheme: 'light',
    locale: 'en-US',
    reducedMotion: 'reduce',
    timezoneId: 'UTC',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command:
      'pnpm --filter @fleetiq/web dev --host 127.0.0.1 --port 5173 --strictPort',
    cwd: repositoryRoot,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
