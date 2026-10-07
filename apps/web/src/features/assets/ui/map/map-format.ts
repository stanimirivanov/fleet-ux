import type { DemoMapLocation } from '../../demo/map-fixture';

/** All relative location ages are evaluated at the fixed sample cutoff. */
export function locationAge(location: DemoMapLocation, asOf: string): string {
  if (!location.observedAt) return 'No position';
  const elapsed = Math.max(
    0,
    Date.parse(asOf) - Date.parse(location.observedAt),
  );
  const minutes = Math.floor(elapsed / 60_000);
  const age =
    minutes >= 60
      ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
      : `${minutes}m`;
  return location.state === 'last-known'
    ? `Last known ${age} before snapshot`
    : `Observed ${age} before snapshot`;
}

export function formatMapTime(value: string | null): string {
  if (!value) return 'Unavailable';
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return 'Invalid time';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(timestamp);
}
