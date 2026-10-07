import { Show } from 'solid-js';
import type {
  RegistryReviewScene,
  RegistryReviewSnapshot,
} from '../../model/registry-review';
import { SamplePanel } from '../overview/SamplePanel';
import { RegistryNodeDetail } from './RegistryNodeDetail';
import { RegistryRelationshipFacts } from './RegistryRelationshipFacts';
import { RegistryStructureOutline } from './RegistryStructureOutline';

/** Scanning outline, selected identity, and complete edge facts form one pane. */
export function RegistryStructure(props: {
  readonly scene: RegistryReviewScene;
  readonly snapshot: RegistryReviewSnapshot;
  readonly selectedNodeId: string | null;
  readonly onSelect: (nodeId: string) => void;
}) {
  return (
    <SamplePanel
      title="Asset structure"
      description="Scanning outline; relationship facts below preserve every effective directed edge"
    >
      <Show
        when={props.snapshot.nodes.length > 0}
        fallback={
          <p role="status" class="p-5 text-xs text-muted">
            No structure is modeled for this sample asset.
          </p>
        }
      >
        <RegistryStructureOutline
          scene={props.scene}
          snapshot={props.snapshot}
          selectedNodeId={props.selectedNodeId}
          onSelect={props.onSelect}
        />
        <RegistryNodeDetail
          scene={props.scene}
          snapshot={props.snapshot}
          selectedNodeId={props.selectedNodeId}
        />
        <RegistryRelationshipFacts snapshot={props.snapshot} />
      </Show>
    </SamplePanel>
  );
}
