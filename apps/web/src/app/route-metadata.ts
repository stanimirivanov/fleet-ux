/** Route and navigation copy is owned by the application composition layer. */
export const APP_ROUTES = {
  overview: { path: '/', title: 'Fleet overview', navigationLabel: 'Overview' },
  assets: { path: '/assets', title: 'Assets', navigationLabel: 'Assets' },
  designSystem: {
    path: '/design-system',
    title: 'Design system',
    navigationLabel: 'Design system',
  },
} as const;

export const PRIMARY_NAVIGATION = [
  { heading: 'Workspaces', routes: [APP_ROUTES.overview, APP_ROUTES.assets] },
  { heading: 'Reference', routes: [APP_ROUTES.designSystem] },
] as const;

export function routeTitle(pathname: string): string {
  return (
    Object.values(APP_ROUTES).find((route) => route.path === pathname)?.title ??
    'Page not found'
  );
}
