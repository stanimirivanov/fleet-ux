import { expect, test } from 'vitest';
import { operatorReturnPath } from './operator-session';

test('restores only an internal metadata route and its explicit context', () => {
  expect(
    operatorReturnPath('/assets/asset-1?tenant=tenant-a&known_at_ms=100'),
  ).toBe('/assets/asset-1?tenant=tenant-a&known_at_ms=100');
  expect(operatorReturnPath('/assets/registry/review?tenant=tenant-a')).toBe(
    '/assets/registry/review?tenant=tenant-a',
  );
  expect(operatorReturnPath('/assets?tenant=tenant-a#untrusted-fragment')).toBe(
    '/assets?tenant=tenant-a',
  );
});

test.each([
  null,
  '',
  'https://other.invalid/assets',
  '//other.invalid/assets',
  '/\\other.invalid/assets',
  '/assets\n',
  '/assets?preview=sample',
  '/map',
  '/assets-not-a-route',
  '/assets/../map',
])('rejects unsafe or non-metadata return target %s', (value) => {
  expect(operatorReturnPath(value)).toBeNull();
});
