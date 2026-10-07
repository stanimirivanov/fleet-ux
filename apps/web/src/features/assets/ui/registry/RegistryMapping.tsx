import type { RegistryAssetRow } from '../../demo/registry-fixture';
import type { RegistryReviewSnapshot } from '../../model/registry-review';
import { RegistryAssetIdentity } from './RegistryAssetIdentity';
import { RegistryMappingTable } from './RegistryMappingTable';

/** Identity and attribution are independent sections in the selected asset zone. */
export function RegistryMapping(props: {
  readonly asset: RegistryAssetRow;
  readonly snapshot: RegistryReviewSnapshot | null;
  readonly selectedSourceKey: string | null;
  readonly onSelectSource: (key: string) => void;
}) {
  return (
    <div class="grid min-w-0 gap-3">
      <RegistryAssetIdentity asset={props.asset} />
      <RegistryMappingTable
        snapshot={props.snapshot}
        selectedSourceKey={props.selectedSourceKey}
        onSelectSource={props.onSelectSource}
      />
    </div>
  );
}
