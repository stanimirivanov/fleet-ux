/** All review timestamps are explicit UTC instants from a fixed sample scene. */
export function formatRegistryTime(milliseconds: number): string {
  return `${new Date(milliseconds).toISOString().replace('T', ' ').slice(0, 19)} UTC`;
}

export function formatRegistryEnd(milliseconds: number | null): string {
  return milliseconds === null
    ? 'Open-ended'
    : formatRegistryTime(milliseconds);
}

export function registryStateLabel(state: string): string {
  return state
    .replaceAll('-', ' ')
    .replace(/^./u, (first) => first.toUpperCase());
}
