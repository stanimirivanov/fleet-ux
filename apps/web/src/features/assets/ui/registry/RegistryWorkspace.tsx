import { Show } from 'solid-js';
import type {
  DemoRegistryScene,
  RegistryAssetRow,
} from '../../demo/registry-fixture';
import { SamplePanel } from '../overview/SamplePanel';
import { RegistryAssetCatalogue } from './RegistryAssetCatalogue';
import { RegistryDetailZone } from './RegistryDetailZone';
import { RegistryReviewNotices } from './RegistryReviewNotices';
import { RegistryReviewTime } from './RegistryReviewTime';
import { RegistryStructure } from './RegistryStructure';
import { useRegistryReview } from './useRegistryReview';

/** Three-zone read-only registry; URL policy belongs to its dedicated controller. */
export function RegistryWorkspace(props: {
  readonly tenantId: string;
  readonly assets: readonly RegistryAssetRow[];
  readonly getDetail: (assetId: string) => DemoRegistryScene | null;
}) {
  const review = useRegistryReview(props);

  return (
    <div class="grid min-w-0 gap-3">
      <RegistryReviewNotices
        scene={review.scene()}
        cutoffRead={review.cutoffRead()}
        selectedAsset={review.selectedAsset()}
        visibleAssets={review.visibleAssets()}
        onResetCutoffs={review.resetCutoffs}
      />
      <Show when={review.scene() && review.cutoffs()}>
        {(cutoffs) => (
          <RegistryReviewTime
            effectiveAtMs={cutoffs().effectiveAtMs}
            knownAtMs={cutoffs().knownAtMs}
            onApply={review.applyCutoffs}
          />
        )}
      </Show>
      <div class="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(14rem,0.8fr)_minmax(0,1.7fr)] xl:grid-cols-[minmax(14rem,0.8fr)_minmax(15rem,0.95fr)_minmax(0,1.9fr)]">
        <RegistryAssetCatalogue
          assets={props.assets}
          visibleAssets={review.visibleAssets()}
          filters={review.filters()}
          selectedAssetId={review.selectedAsset()?.asset.id ?? null}
          onSearch={review.search}
          onType={review.selectType}
          onSelect={review.selectAsset}
        />
        <Show
          when={review.structure()}
          fallback={
            <SamplePanel
              title="Asset structure"
              description="Directed relationships at a selected review time"
            >
              <p role="status" class="p-5 text-xs text-muted">
                {review.cutoffRead().status === 'invalid'
                  ? 'Reset the invalid review times before inspecting structure.'
                  : review.selectedAsset()
                    ? 'No structure is modeled for this sample identity.'
                    : 'Select an asset from the sample catalogue.'}
              </p>
            </SamplePanel>
          }
        >
          {(structure) => (
            <RegistryStructure
              scene={structure().detail}
              snapshot={structure().current}
              selectedNodeId={review.selectedNodeId()}
              onSelect={review.selectNode}
            />
          )}
        </Show>
        <RegistryDetailZone
          selectedAsset={review.selectedAsset()}
          requestedAsset={review.requestedAsset()}
          snapshot={review.snapshot()}
          selectedSource={review.selectedSource()}
          requestedSourceKey={review.requestedSourceKey()}
          onSelectSource={review.selectSource}
        />
      </div>
      <Show when={props.assets.length === 0}>
        <p role="status" class="text-xs text-muted">
          This sample tenant has no catalogue identities. It says nothing about
          a connected fleet.
        </p>
      </Show>
    </div>
  );
}
