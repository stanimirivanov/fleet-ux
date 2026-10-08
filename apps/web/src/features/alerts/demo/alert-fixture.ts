import type { AlertRecord } from '../model/alert-triage';
import { RAIL_ALERTS } from './rail-alerts';
import { SUPPORT_ALERTS } from './support-alerts';

/** Fixed sample cutoff, shared conceptually with the other development views. */
export const DEMO_ALERTS_AS_OF = '2026-10-06T10:00:00Z';

export interface DemoAlertTriage {
  readonly source: 'sample';
  readonly asOf: string;
  readonly tenantId: string;
  readonly alerts: readonly AlertRecord[];
}

/**
 * Returns a deterministic, tenant-scoped visual fixture. It does not issue a
 * backend read or imply an alert lifecycle contract.
 *
 * The first three IDs, asset links, and titles match the sample overview.
 * Their details are independently authored here to avoid importing private
 * files across feature boundaries.
 */
export function getDemoAlertTriage(tenantId: string): DemoAlertTriage {
  return {
    source: 'sample',
    asOf: DEMO_ALERTS_AS_OF,
    tenantId,
    alerts: [...RAIL_ALERTS, ...SUPPORT_ALERTS].filter(
      (alert) => alert.tenantId === tenantId,
    ),
  };
}
