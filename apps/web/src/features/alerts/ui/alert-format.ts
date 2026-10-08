/** Fixed-snapshot formatting: sample age never advances with wall time. */
export function formatAlertTime(value: string | null): string {
  if (!value) return 'Not observed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid sample time';
  return `${new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)} UTC`;
}

export function formatAlertAge(value: string, asOf: string): string {
  const minutes = Math.max(
    0,
    Math.floor((Date.parse(asOf) - Date.parse(value)) / 60_000),
  );
  if (!Number.isFinite(minutes)) return 'Age unavailable';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours} h${remainder ? ` ${remainder} min` : ''}`;
}

export function formatAlertState(state: string): string {
  if (state === 'open') return 'Open';
  if (state === 'acknowledged') return 'Acknowledged';
  if (state === 'closed') return 'Closed';
  return 'Unknown';
}

export function formatAlertSeverity(severity: string): string {
  if (severity === 'critical') return 'Critical';
  if (severity === 'attention') return 'Warning';
  if (severity === 'information') return 'Information';
  return 'Unknown';
}
