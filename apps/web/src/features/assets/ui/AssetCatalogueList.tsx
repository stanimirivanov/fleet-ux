import { For, Show } from 'solid-js';
import type { AssetPage, AssetSummary } from '../model/asset-catalogue';
import { AssetCataloguePagination } from './AssetCataloguePagination';
import { CatalogueEmpty } from './AssetCatalogueStates';
import type { AssetCatalogueCopy } from './asset-catalogue-copy';

function AssetCatalogueRow(props: { readonly asset: AssetSummary }) {
  return (
    <li class="grid min-w-0 gap-2 border-t border-outline px-4 py-3 text-xs sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_5rem] sm:items-center">
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold">{props.asset.name}</p>
        <p class="break-all font-mono text-[11px] text-muted">
          {props.asset.id}
        </p>
      </div>
      <p class="break-all text-muted">{props.asset.assetType.id}</p>
      <p class="tabular-nums text-muted sm:text-right">
        v{props.asset.assetType.version}
      </p>
    </li>
  );
}

/** Dense identity rows; this transport contract has no status or location fields. */
export function AssetCatalogueList(props: {
  readonly page: AssetPage;
  readonly after?: string;
  readonly pageHref?: (after?: string) => string;
  readonly copy: AssetCatalogueCopy;
}) {
  return (
    <>
      <Show when={props.after !== undefined}>
        <p class="mb-3 text-xs text-muted">{props.copy.afterNotice}</p>
      </Show>
      <Show
        when={props.page.assets.length > 0}
        fallback={<CatalogueEmpty after={props.after} copy={props.copy} />}
      >
        <h3 class="text-sm font-semibold">{props.copy.listTitle}</h3>
        <div class="mt-3 overflow-hidden rounded-lg border border-outline">
          <div
            aria-hidden="true"
            class="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_5rem] bg-canvas px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted sm:grid"
          >
            <span>Asset / ID</span>
            <span>Type</span>
            <span class="text-right">Version</span>
          </div>
          <ul aria-label={props.copy.listLabel}>
            <For each={props.page.assets}>
              {(asset) => <AssetCatalogueRow asset={asset} />}
            </For>
          </ul>
        </div>
      </Show>
      <AssetCataloguePagination
        page={props.page}
        after={props.after}
        pageHref={props.pageHref}
        copy={props.copy}
      />
    </>
  );
}
