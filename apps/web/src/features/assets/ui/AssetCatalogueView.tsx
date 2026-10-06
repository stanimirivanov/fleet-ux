import {
  createEffect,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
} from 'solid-js';
import type { AssetCatalogueReader, AssetPage } from '../model/asset-catalogue';

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly page: AssetPage }
  | { readonly kind: 'error' };

/** Bounded catalogue page driven by an injected, validated read adapter. */
export function AssetCatalogueView(props: {
  readonly reader: AssetCatalogueReader;
  readonly tenantId: string;
}) {
  const [state, setState] = createSignal<LoadState>({ kind: 'loading' });
  const [retry, setRetry] = createSignal(0);

  createEffect(() => {
    retry();
    const reader = props.reader;
    const tenantId = props.tenantId;
    let active = true;
    setState({ kind: 'loading' });

    void reader.listPage({ tenantId, limit: 50 }).then(
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
          {(page) => <AssetList page={page()} />}
        </Match>
      </Switch>
    </div>
  );
}

function AssetList(props: { readonly page: AssetPage }) {
  return (
    <Show
      when={props.page.assets.length > 0}
      fallback={
        <p role="status" class="text-sm leading-7 text-muted">
          No assets exist in this sample catalogue page. This says nothing about
          a connected fleet.
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
      <Show when={props.page.nextAfter !== null}>
        <p class="mt-4 text-sm leading-6 text-muted">
          Additional entries exist beyond this first sample page.
        </p>
      </Show>
    </Show>
  );
}
