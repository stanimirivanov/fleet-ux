import { createMemo, Match, Switch } from 'solid-js';
import type { AssetCatalogueReader } from '../model/asset-catalogue';
import { AssetCatalogueList } from './AssetCatalogueList';
import { CatalogueError, CatalogueLoading } from './AssetCatalogueStates';
import {
  type AssetCatalogueCopy,
  defaultAssetCatalogueCopy,
} from './asset-catalogue-copy';
import { useAssetCatalogue } from './useAssetCatalogue';

/** Composes catalogue states and presentation around an injected read port. */
export function AssetCatalogueView(props: {
  readonly reader: AssetCatalogueReader;
  readonly tenantId: string;
  readonly after?: string;
  readonly limit?: number;
  readonly pageHref?: (after?: string) => string;
  readonly copy?: AssetCatalogueCopy;
}) {
  const catalogue = useAssetCatalogue(props);
  const copy = () => props.copy ?? defaultAssetCatalogueCopy;
  const page = createMemo(() => {
    const current = catalogue.state();
    return current.kind === 'ready' ? current.page : undefined;
  });
  const failure = createMemo(() => {
    const current = catalogue.state();
    return current.kind === 'error' ? current.failure : undefined;
  });

  return (
    <div class="border-t border-outline pt-6">
      <Switch>
        <Match when={catalogue.state().kind === 'loading'}>
          <CatalogueLoading copy={copy()} />
        </Match>
        <Match when={failure()}>
          {(current) => (
            <CatalogueError
              copy={copy()}
              failure={current()}
              onRetry={catalogue.retry}
            />
          )}
        </Match>
        <Match when={page()}>
          {(current) => (
            <AssetCatalogueList
              page={current()}
              after={props.after}
              pageHref={props.pageHref}
              copy={copy()}
            />
          )}
        </Match>
      </Switch>
    </div>
  );
}
