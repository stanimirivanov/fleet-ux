import { expect, test } from '@playwright/test';
import { ShellPage } from '../pages/shell.page';

test('theme preference cycles and survives a reload', async ({ page }) => {
  const shell = new ShellPage(page);
  await shell.open();

  await expect(shell.themeButton).toHaveAccessibleName(
    'Theme: light. Switch to dark.',
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await shell.cycleTheme();
  await expect(shell.themeButton).toHaveAccessibleName(
    'Theme: dark. Switch to system.',
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(shell.themeButton).toHaveAccessibleName(
    'Theme: dark. Switch to system.',
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('system preference responds to browser color-scheme changes', async ({
  page,
}) => {
  const shell = new ShellPage(page);
  await page.emulateMedia({ colorScheme: 'light' });
  await shell.open();
  await shell.cycleTheme();
  await shell.cycleTheme();

  await expect(shell.themeButton).toHaveAccessibleName(
    'Theme: system (light). Switch to light.',
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(shell.themeButton).toHaveAccessibleName(
    'Theme: system (dark). Switch to light.',
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
