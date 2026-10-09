import { useLocation, useNavigate } from '@solidjs/router';
import { createEffect, createMemo } from 'solid-js';
import { metadataHref, readMetadataQuery } from '../../model/metadata-query';

/** URL owns tenant, selection, cutoffs, filters, and independent cursor scopes. */
export function useMetadataWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = createMemo(() => readMetadataQuery(location.search));
  const query = createMemo(() => {
    const current = result();
    return current.kind === 'ready' ? current.query : null;
  });
  createEffect(() => {
    if (result().kind !== 'missing-cutoffs') return;
    const now = String(Date.now());
    navigate(
      metadataHref(location.pathname, location.search, {
        effective_at_ms: now,
        known_at_ms: now,
      }),
      { replace: true },
    );
  });
  return {
    result,
    query,
    value: (key: string) => new URLSearchParams(location.search).get(key) ?? '',
    href: (
      path: string,
      changes: Readonly<Record<string, string | null>> = {},
    ) => metadataHref(path, location.search, changes),
    update: (
      changes: Readonly<Record<string, string | null>>,
      replace = false,
    ) =>
      navigate(metadataHref(location.pathname, location.search, changes), {
        replace,
      }),
  };
}
export type MetadataWorkspace = ReturnType<typeof useMetadataWorkspace>;
