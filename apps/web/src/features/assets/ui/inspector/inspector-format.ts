/** Fixed UTC formatting keeps sample event and receipt time distinguishable. */
export function formatSampleTime(value: string | null): string {
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
