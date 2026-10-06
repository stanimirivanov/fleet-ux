import { A } from '@solidjs/router';
import {
  createEffect,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
} from 'solid-js';
import type {
  AssetCatalogueReader,
  AssetPage,
  AssetPageRequest,
} from '../model/asset-catalogue';

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly page: AssetPage }
  | { readonly kind: 'error' };

type PageHref = (after?: string) => string;

/** Bounded catalogue page driven by an injected, validated read adapter. */
export function AssetCatalogueView(props: {
  readonly reader: AssetCatalogueReader;
  readonly tenantId: string;
  readonly after?: string;
  readonly limit?: number;
  readonly pageHref?: PageHref;
}) {
  const [state, setState] = createSignal<LoadState>({ kind: 'loading' });
  const [retry, setRetry] = createSignal(0);

  createEffect(() => {
    retry();
    const reader = props.reader;
    const tenantId = props.tenantId;
    const after = props.after;
    const limit = props.limit ?? 50;
    const request: AssetPageRequest =
      after === undefined ? { tenantId, limit } : { tenantId, limit, after };
    let active = true;
    setState({ kind: 'loading' });

    void reader.listPage(request).then(
      (page) => {
        if (active) setState({ kind: 'ready', page });
      },
      () => {
        if (active) setState({ kind: 'error' });
      },
    );

    onCleanup(() => {
      active = false;
    });
  });

  const loadedPage = () => {
    const current = state();
    return current.kind === 'ready' ? current.page : undefined;
  };

  return (
    <div class="mt-6 border-t border-outline pt-6">
      <Switch>
        <Match when={state().kind === 'loading'}>
          <p role="status" class="text-sm text-muted">
            Loading catalogue entries…
          </p>
        </Match>
        <Match when={state().kind === 'error'}>
          <div role="alert" class="rounded-lg border border-outline p-5">
            <h3 class="text-base font-semibold">
              Asset catalogue could not be loaded
            </h3>
            <p class="mt-2 text-sm leading-6 text-muted">
              The sample reader failed. No assets have been shown.
            </p>
            <button
              type="button"
              class="mt-4 inline-flex min-h-11 items-center rounded-lg border border-outline px-4 text-sm font-semibold text-accent hover:bg-canvas"
              onClick={() => setRetry((value) => value + 1)}
            >
              Retry loading
            </button>
          </div>
        </Match>
        <Match when={loadedPage()}>
          {(page) => (
            <AssetList
              page={page()}
              after={props.after}
              pageHref={props.pageHref}
            />
          )}
        </Match>
      </Switch>
    </div>
  );
}

function AssetList(props: {
  readonly page: AssetPage;
  readonly after?: string;
  readonly pageHref?: PageHref;
}) {
  const firstHref = () =>
    props.after === undefined ? undefined : props.pageHref?.();
  const nextHref = () =>
    props.page.nextAfter === null
      ? undefined
      : props.pageHref?.(props.page.nextAfter);

  return (
    <>
      <Show when={props.after !== undefined}>
        <p class="mb-4 text-sm text-muted">
          Showing entries after the selected sample cursor.
        </p>
      </Show>
      <Show
        when={props.page.assets.length > 0}
        fallback={
          <p role="status" class="text-sm leading-7 text-muted">
            <Show
              when={props.after !== undefined}
              fallback={
                <>
                  No assets exist in this sample catalogue page. This says
                  nothing about a connected fleet.
                </>
              }
            >
              No further sample assets follow this cursor. This says nothing
              about a connected fleet.
            </Show>
          </p>
        }
      >
        <h3 class="text-base font-semibold">Catalogue entries</h3>
        <ul class="mt-4 grid gap-3" aria-label="Sample assets">
          <For each={props.page.assets}>
            {(asset) => (
              <li class="min-w-0 rounded-lg border border-outline bg-canvas p-4 sm:p-5">
                <p class="break-words text-base font-semibold">{asset.name}</p>
                <dl class="mt-3 grid min-w-0 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                  <div class="min-w-0">
                    <dt class="text-muted">Asset ID</dt>
                    <dd class="mt-1 break-all font-medium">{asset.id}</dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-muted">Asset type</dt>
                    <dd class="mt-1 break-all font-medium">
                      {asset.assetType.id}
                    </dd>
                  </div>
                  <div class="min-w-0">
                    <dt class="text-muted">Type version</dt>
                    <dd class="mt-1 font-medium">{asset.assetType.version}</dd>
                  </div>
                </dl>
              </li>
            )}
          </For>
        </ul>
      </Show>
      <Show when={props.page.nextAfter !== null && !props.pageHref}>
        <p class="mt-4 text-sm leading-6 text-muted">
          Additional entries exist beyond this first sample page.
        </p>
      </Show>
      <Show when={firstHref() || nextHref()}>
        <nav
          aria-label="Asset catalogue pages"
          class="mt-5 flex flex-wrap gap-3 border-t border-outline pt-5"
        >
          <Show when={firstHref()}>
            {(href) => (
              <A
                href={href()}
                class="inline-flex min-h-11 items-center rounded-lg border border-outline px-4 text-sm font-semibold text-accent hover:bg-canvas"
              >
                First page
              </A>
            )}
          </Show>
          <Show when={nextHref()}>
            {(href) => (
              <A
                href={href()}
                class="inline-flex min-h-11 items-center rounded-lg border border-outline px-4 text-sm font-semibold text-accent hover:bg-canvas"
              >
                Next page
              </A>
            )}
          </Show>
        </nav>
      </Show>
    </>
  );
}
