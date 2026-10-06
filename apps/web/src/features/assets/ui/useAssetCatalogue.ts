import { createEffect, createSignal, on, onCleanup } from 'solid-js';
import {
  type AssetCatalogueLoadFailure,
  type AssetCatalogueReader,
  type AssetPage,
  type AssetPageRequest,
  classifyAssetCatalogueFailure,
} from '../model/asset-catalogue';

export type AssetCatalogueState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly page: AssetPage }
  | { readonly kind: 'error'; readonly failure: AssetCatalogueLoadFailure };

/**
 * Owns one catalogue read at a time.
 *
 * A new tenant, cursor, limit, or retry aborts the old read. The active flag
 * also protects state when an adapter does not implement cancellation.
 */
export function useAssetCatalogue(props: {
  readonly reader: AssetCatalogueReader;
  readonly tenantId: string;
  readonly after?: string;
  readonly limit?: number;
}) {
  const [state, setState] = createSignal<AssetCatalogueState>({
    kind: 'loading',
  });
  const [retryCount, setRetryCount] = createSignal(0);

  createEffect(
    on(
      () =>
        [
          props.reader,
          props.tenantId,
          props.after,
          props.limit,
          retryCount(),
        ] as const,
      ([reader, tenantId, after, requestedLimit]) => {
        const limit = requestedLimit ?? 50;
        const request: AssetPageRequest =
          after === undefined
            ? { tenantId, limit }
            : { tenantId, limit, after };
        const controller = new AbortController();
        let active = true;

        onCleanup(() => {
          active = false;
          controller.abort();
        });
        setState({ kind: 'loading' });

        try {
          void reader.listPage(request, { signal: controller.signal }).then(
            (page) => {
              if (active) setState({ kind: 'ready', page });
            },
            (cause: unknown) => {
              if (active) {
                setState({
                  kind: 'error',
                  failure: classifyAssetCatalogueFailure(cause),
                });
              }
            },
          );
        } catch (cause) {
          // A reader should return a promise, but a broken adapter may throw first.
          if (active) {
            setState({
              kind: 'error',
              failure: classifyAssetCatalogueFailure(cause),
            });
          }
        }
      },
    ),
  );

  return {
    state,
    retry: () => setRetryCount((count) => count + 1),
  };
}
