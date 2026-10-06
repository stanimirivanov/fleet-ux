export type BrowserScenarioMode = 'test-only' | 'user-guide';

/** Guide media is opt-in; the ordinary browser suite stays fast and quiet. */
export const browserScenarioMode = (): BrowserScenarioMode => {
  const configured = process.env.FLEETIQ_E2E_MODE?.trim();

  if (configured === undefined || configured === 'test-only') {
    return 'test-only';
  }

  if (configured === 'user-guide') {
    return configured;
  }

  throw new Error('FLEETIQ_E2E_MODE must be "test-only" or "user-guide".');
};
