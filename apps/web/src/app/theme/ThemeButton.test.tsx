import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { createSignal } from 'solid-js';
import { expect, test } from 'vitest';
import { ThemeButton } from './ThemeButton';
import { nextThemePreference, type ThemePreference } from './theme-preference';

test('the accessible theme control cycles and describes the effective system theme', async () => {
  const [preference, setPreference] = createSignal<ThemePreference>('light');
  const [systemTheme, setSystemTheme] = createSignal<'light' | 'dark'>('dark');
  const user = userEvent.setup();

  render(() => (
    <ThemeButton
      preference={preference}
      resolvedTheme={systemTheme}
      onCycle={() => setPreference(nextThemePreference(preference()))}
    />
  ));

  const button = screen.getByRole('button', {
    name: 'Theme: light. Switch to dark.',
  });

  await user.click(button);
  expect(
    screen.getByRole('button', { name: 'Theme: dark. Switch to system.' }),
  ).toBe(button);

  await user.click(button);
  expect(
    screen.getByRole('button', {
      name: 'Theme: system (dark). Switch to light.',
    }),
  ).toBe(button);

  setSystemTheme('light');
  expect(
    screen.getByRole('button', {
      name: 'Theme: system (light). Switch to light.',
    }),
  ).toBe(button);

  await user.click(button);
  expect(
    screen.getByRole('button', { name: 'Theme: light. Switch to dark.' }),
  ).toBe(button);
});
