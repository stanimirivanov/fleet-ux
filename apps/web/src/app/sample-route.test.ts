import { expect, test } from 'vitest';
import { isDevelopmentSampleRoute, navigationHref } from './sample-route';

test('sample status is restricted to exact development preview routes', () => {
  expect(isDevelopmentSampleRoute('/', '', true)).toBe(true);
  expect(isDevelopmentSampleRoute('/alerts', '?preview=sample', true)).toBe(
    true,
  );
  expect(isDevelopmentSampleRoute('/alerts', '?preview=sample', false)).toBe(
    false,
  );
  expect(
    isDevelopmentSampleRoute('/alerts/missing', '?preview=sample', true),
  ).toBe(false);
  expect(isDevelopmentSampleRoute('/alerts', '', true)).toBe(false);
  expect(
    isDevelopmentSampleRoute('/assets/asset-004', '?preview=sample', true),
  ).toBe(true);
  expect(
    isDevelopmentSampleRoute(
      '/assets/registry/review',
      '?preview=sample',
      true,
    ),
  ).toBe(true);
});

test('primary links opt into only available development previews', () => {
  expect(navigationHref('/alerts', true)).toBe('/alerts?preview=sample');
  expect(navigationHref('/assets', true)).toBe('/assets?preview=sample');
  expect(navigationHref('/map', true)).toBe('/map?preview=sample');
  expect(navigationHref('/alerts', false)).toBe('/alerts');
  expect(navigationHref('/', true)).toBe('/');
});
