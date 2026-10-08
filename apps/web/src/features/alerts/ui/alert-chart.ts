import type { AlertSeriesPoint } from '../model/alert-triage';

export interface ChartGeometry {
  readonly paths: readonly string[];
  readonly points: readonly { x: number; y: number; value: number }[];
  readonly gaps: readonly number[];
  readonly lowerY: number | null;
  readonly upperY: number | null;
  readonly min: number;
  readonly max: number;
}
const LEFT = 44;
const RIGHT = 596;
const TOP = 12;
const BOTTOM = 126;

/** Null observations break the line and mark a gap; no interpolation is invented. */
export function projectAlertChart(
  series: readonly AlertSeriesPoint[],
  lower: number | null,
  upper: number | null,
): ChartGeometry {
  const numeric = series.filter(
    (point): point is AlertSeriesPoint & { value: number } =>
      point.value !== null && Number.isFinite(point.value),
  );
  const values = numeric.map((point) => point.value);
  if (lower !== null) values.push(lower);
  if (upper !== null) values.push(upper);
  const low = Math.min(...(values.length ? values : [0]));
  const high = Math.max(...(values.length ? values : [1]));
  const span = Math.max(high - low, 1);
  const min = low - span * 0.12;
  const max = high + span * 0.12;
  const times = series.map((point) => Date.parse(point.at));
  const start = Math.min(...(times.length ? times : [0]));
  const end = Math.max(...(times.length ? times : [1]));
  const duration = Math.max(end - start, 1);
  const x = (at: string) =>
    LEFT + ((Date.parse(at) - start) / duration) * (RIGHT - LEFT);
  const y = (value: number) =>
    BOTTOM - ((value - min) / (max - min)) * (BOTTOM - TOP);
  const paths: string[] = [];
  const points: { x: number; y: number; value: number }[] = [];
  const gaps: number[] = [];
  let path = '';
  for (const point of series) {
    if (point.value === null) {
      if (path) paths.push(path);
      path = '';
      gaps.push(x(point.at));
      continue;
    }
    const coordinate = `${Math.round(x(point.at))} ${Math.round(y(point.value))}`;
    path += (path ? ' L ' : 'M ') + coordinate;
    points.push({ x: x(point.at), y: y(point.value), value: point.value });
  }
  if (path) paths.push(path);
  return {
    paths,
    points,
    gaps,
    lowerY: lower === null ? null : y(lower),
    upperY: upper === null ? null : y(upper),
    min,
    max,
  };
}
