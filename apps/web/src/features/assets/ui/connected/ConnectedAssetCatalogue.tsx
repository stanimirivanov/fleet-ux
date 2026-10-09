import { createMemo } from 'solid-js';
import type { AssetPageRequest } from '../../model/asset-catalogue';
import { CatalogueFilters } from './CatalogueFilters';
import { CatalogueIdentityList } from './CatalogueIdentityList';
import { CatalogueNavigation } from './CatalogueNavigation';
import { MetadataPanel } from './MetadataPanel';
import { MetadataReadContent } from './MetadataReadContent';
import { useMetadataRead } from './useMetadataRead';
import type { MetadataWorkspace } from './useMetadataWorkspace';

/** Current-page filtering does not imply server search or total fleet counts. */
export function ConnectedAssetCatalogue(props: {
  readonly workspace: MetadataWorkspace;
  readonly selectable?: boolean;
}) {
  const request = createMemo<AssetPageRequest | null>(() => {
    const query = props.workspace.query();
    return query
      ? {
          tenantId: query.tenantId,
          limit: 50,
          ...(query.after === undefined ? {} : { after: query.after }),
        }
      : null;
  });
  const read = useMetadataRead(request, (reader, query, options) =>
    reader.listPage(query, options),
  );
  const page = createMemo(() => {
    const state = read.state();
    return state.kind === 'ready' ? state.value : null;
  });
  const types = createMemo(() =>
    [
      ...new Set(page()?.assets.map((asset) => asset.assetType.id) ?? []),
    ].sort(),
  );
  const filtered = createMemo(() => {
    const query = props.workspace.query();
    const needle = query?.q.toLocaleLowerCase() ?? '';
    return (page()?.assets ?? []).filter(
      (asset) =>
        (!query?.type || asset.assetType.id === query.type) &&
        `${asset.name} ${asset.id}`.toLocaleLowerCase().includes(needle),
    );
  });
  return (
    <MetadataPanel
      title="Asset catalogue"
      description="One bounded page of stable identities. Search and type filters apply to this page only."
    >
      <MetadataReadContent
        state={read.state()}
        label="asset catalogue"
        retry={read.retry}
      >
        {(value) => (
          <div class="grid gap-4">
            <CatalogueFilters workspace={props.workspace} types={types()} />
            <CatalogueIdentityList
              assets={filtered()}
              pageIsEmpty={value.assets.length === 0}
              workspace={props.workspace}
              selectable={props.selectable ?? false}
            />
            <CatalogueNavigation
              workspace={props.workspace}
              selectable={props.selectable ?? false}
              nextAfter={value.nextAfter}
            />
          </div>
        )}
      </MetadataReadContent>
    </MetadataPanel>
  );
}
