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

/** Unavailable destinations make the intended workspace shape visible without dead links. */
export const PRIMARY_NAVIGATION = [
  {
    heading: 'Workspace',
    items: [
      { kind: 'route', route: APP_ROUTES.overview, icon: 'overview' },
      { kind: 'planned', label: 'Map', icon: 'map' },
      { kind: 'route', route: APP_ROUTES.assets, icon: 'assets' },
      { kind: 'planned', label: 'Alerts', icon: 'alerts' },
      { kind: 'planned', label: 'Insights', icon: 'insights' },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { kind: 'planned', label: 'Admin', icon: 'admin' },
      { kind: 'route', route: APP_ROUTES.designSystem, icon: 'design' },
    ],
  },
] as const;

export function routeTitle(pathname: string): string {
  return (
    Object.values(APP_ROUTES).find((route) => route.path === pathname)?.title ??
    'Page not found'
  );
}
