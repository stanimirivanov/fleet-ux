import { Show } from 'solid-js';
import type { RegistryAssetRow } from '../../demo/registry-fixture';
import type {
  RegistryCutoffRead,
  RegistryReviewScene,
} from '../../model/registry-review';
import { formatRegistryTime } from './registry-format';

/** Sample context and recoverable URL states stay outside the three data zones. */
export function RegistryReviewNotices(props: {
  readonly scene: RegistryReviewScene | null;
  readonly cutoffRead: RegistryCutoffRead;
  readonly selectedAsset: RegistryAssetRow | null;
  readonly visibleAssets: readonly RegistryAssetRow[];
  readonly onResetCutoffs: () => void;
}) {
  const selectionHidden = () =>
    props.selectedAsset !== null &&
    !props.visibleAssets.some(
      (row) => row.asset.id === props.selectedAsset?.asset.id,
    );

  return (
    <>
      <div class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-sample-outline bg-sample-surface px-3 py-2 text-xs text-muted">
        <span>Read-only modeled configuration · Sample data</span>
        <span>
          {props.scene
            ? `Fixed sample scene · ${formatRegistryTime(props.scene.asOfMs)}`
            : 'No modeled scene selected'}
        </span>
      </div>
      <Show when={props.cutoffRead.status === 'invalid'}>
        <div
          role="alert"
          class="rounded-md border border-status-warning/30 bg-status-warning/5 p-4 text-xs"
        >
          <h2 class="font-semibold">Invalid review times</h2>
          <p class="mt-1 text-muted">
            The effective and known times must be one valid UTC pair in the
            review URL.
          </p>
          <button
            type="button"
            onClick={props.onResetCutoffs}
            disabled={!props.scene}
            class="mt-3 min-h-9 rounded-md border border-outline bg-surface px-3 font-semibold text-accent disabled:opacity-50"
          >
            Reset review times
          </button>
        </div>
      </Show>
      <Show when={selectionHidden()}>
        <p role="status" class="text-xs text-muted">
          The selected asset is hidden by the current catalogue filters; its
          review remains open.
        </p>
      </Show>
    </>
  );
}
