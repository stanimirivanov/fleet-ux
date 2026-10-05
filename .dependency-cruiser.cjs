/** Structural import rules for the Solid web application. */
module.exports = {
  forbidden: [
    {
      name: 'no-circular-imports',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'shared-cannot-import-features-or-app',
      severity: 'error',
      from: { path: '^apps/web/src/shared/' },
      to: { path: '^apps/web/src/(features|app)/' },
    },
    {
      name: 'feature-cannot-import-app-composition',
      severity: 'error',
      from: { path: '^apps/web/src/features/' },
      to: { path: '^apps/web/src/app/' },
    },
    {
      name: 'feature-model-cannot-import-ui-or-api',
      severity: 'error',
      from: { path: '^apps/web/src/features/[^/]+/model/' },
      to: { path: '^apps/web/src/features/[^/]+/(ui|api)/' },
    },
    {
      name: 'packages-cannot-import-app',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(node_modules|dist)/' },
  },
};
