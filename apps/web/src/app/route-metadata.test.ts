import { expect, test } from 'vitest';
import { routeTitle } from './route-metadata';

test('asset inspector routes keep a meaningful document and landmark title', () => {
  expect(routeTitle('/assets/asset-001')).toBe('Asset inspector');
  expect(routeTitle('/assets/asset%201')).toBe('Asset inspector');
  expect(routeTitle('/assets/asset-001/events')).toBe('Page not found');
});
