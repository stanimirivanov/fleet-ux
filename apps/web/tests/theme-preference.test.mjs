import assert from 'node:assert/strict';
import test from 'node:test';
import {
  nextThemePreference,
  parseThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
} from '../src/app/theme/theme-preference.ts';

test('theme control cycles through light, dark, and system', () => {
  assert.equal(nextThemePreference('light'), 'dark');
  assert.equal(nextThemePreference('dark'), 'system');
  assert.equal(nextThemePreference('system'), 'light');
});

test('stored preference accepts only exact known values', () => {
  assert.equal(THEME_STORAGE_KEY, 'fleetiq.theme-preference.v1');
  for (const preference of ['light', 'dark', 'system']) {
    assert.equal(parseThemePreference(preference), preference);
  }
  for (const invalid of [
    null,
    undefined,
    '',
    'auto',
    'Dark',
    ' light ',
    1,
    {},
  ]) {
    assert.equal(parseThemePreference(invalid), null);
  }
});

test('system preference resolves to the current system theme', () => {
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});
