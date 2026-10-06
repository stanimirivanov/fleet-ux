import { For, type JSX, Show } from 'solid-js';
import type { AssetPage, AssetSummary } from '../model/asset-catalogue';
import { AssetCataloguePagination } from './AssetCataloguePagination';
import { CatalogueEmpty } from './AssetCatalogueStates';
import type { AssetCatalogueCopy } from './asset-catalogue-copy';

function AssetField(props: {
  readonly label: string;
  readonly value: JSX.Element;
  readonly breakAll?: boolean;
}) {
  return (
    <div class="min-w-0">
      <dt class="text-muted">{props.label}</dt>
      <dd
        class={
          props.breakAll ? 'mt-1 break-all font-medium' : 'mt-1 font-medium'
        }
      >
        {props.value}
      </dd>
    </div>
  );
}

function AssetCatalogueCard(props: { readonly asset: AssetSummary }) {
  return (
    <li class="min-w-0 rounded-lg border border-outline bg-canvas p-4 sm:p-5">
      <p class="break-words text-base font-semibold">{props.asset.name}</p>
      <dl class="mt-3 grid min-w-0 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        <AssetField label="Asset ID" value={props.asset.id} breakAll />
        <AssetField
          label="Asset type"
          value={props.asset.assetType.id}
          breakAll
        />
        <AssetField
          label="Type version"
          value={props.asset.assetType.version}
        />
      </dl>
    </li>
  );
}

export function AssetCatalogueList(props: {
  readonly page: AssetPage;
  readonly after?: string;
  readonly pageHref?: (after?: string) => string;
  readonly copy: AssetCatalogueCopy;
}) {
  return (
    <>
      <Show when={props.after !== undefined}>
        <p class="mb-4 text-sm text-muted">{props.copy.afterNotice}</p>
      </Show>
      <Show
        when={props.page.assets.length > 0}
        fallback={<CatalogueEmpty after={props.after} copy={props.copy} />}
      >
        <h3 class="text-base font-semibold">{props.copy.listTitle}</h3>
        <ul class="mt-4 grid gap-3" aria-label={props.copy.listLabel}>
          <For each={props.page.assets}>
            {(asset) => <AssetCatalogueCard asset={asset} />}
          </For>
        </ul>
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
