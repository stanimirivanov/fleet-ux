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
      name: 'feature-cannot-import-another-feature-private-file',
      severity: 'error',
      from: { path: '^apps/web/src/features/([^/]+)/' },
      to: {
        path: '^apps/web/src/features/',
        pathNot: '^apps/web/src/features/$1/',
      },
    },
    {
      name: 'feature-model-cannot-import-ui-or-api',
      severity: 'error',
      from: { path: '^apps/web/src/features/[^/]+/model/' },
      to: { path: '^apps/web/src/features/[^/]+/(ui|api)/' },
    },
    {
      name: 'feature-api-cannot-import-ui',
      severity: 'error',
      from: { path: '^apps/web/src/features/[^/]+/api/' },
      to: { path: '^apps/web/src/features/[^/]+/ui/' },
    },
    {
      name: 'feature-ui-cannot-import-generated-transport',
      severity: 'error',
      from: { path: '^apps/web/src/features/[^/]+/ui/' },
      to: { path: '^apps/web/src/generated/' },
    },
    {
      name: 'no-unresolved-package-imports',
      severity: 'error',
      from: { path: '^apps/web/src/' },
      to: { path: '^#', couldNotResolve: true },
    },
    {
      name: 'external-imports-use-shared-ui-entry',
      severity: 'error',
      from: { path: '^apps/web/src/', pathNot: '^apps/web/src/shared/ui/' },
      to: {
        path: '^apps/web/src/shared/ui/',
        pathNot: '^apps/web/src/shared/ui/index[.]ts$',
      },
    },
    {
      name: 'external-imports-use-feature-entry',
      severity: 'error',
      from: { path: '^apps/web/src/', pathNot: '^apps/web/src/features/' },
      to: {
        path: '^apps/web/src/features/',
        pathNot: '^apps/web/src/features/[^/]+/index[.]ts$',
      },
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
