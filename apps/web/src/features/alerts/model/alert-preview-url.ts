/** A deliberate development opt-in. Production cannot activate the sample route. */
export function isAlertsSamplePreview(
  pathname: string,
  search: string,
): boolean {
  const previews = new URLSearchParams(search).getAll('preview');
  return (
    pathname === '/alerts' && previews.length === 1 && previews[0] === 'sample'
  );
}

export function alertsSampleHref(): string {
  return '/alerts?preview=sample';
}
