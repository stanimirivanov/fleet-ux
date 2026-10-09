import { createMemo, Show } from 'solid-js';
import type { AssetSnapshotRequest } from '../../model/metadata';
import { BindingRecords } from './BindingRecords';
import { MetadataPagination } from './MetadataPagination';
import { MetadataPanel } from './MetadataPanel';
import { MetadataReadContent } from './MetadataReadContent';
import { useMetadataRead } from './useMetadataRead';
import type { MetadataWorkspace } from './useMetadataWorkspace';

/** Binding pages describe configured attribution, not observed telemetry values. */
export function TargetBindingEvidence(props: {
  readonly workspace: MetadataWorkspace;
  readonly assetId?: string;
  readonly path: string;
}) {
  const request = createMemo<AssetSnapshotRequest | null>(() => {
    const query = props.workspace.query();
    return query && props.assetId
      ? {
          tenantId: query.tenantId,
          assetId: props.assetId,
          effectiveAtMs: query.effectiveAtMs,
          knownAtMs: query.knownAtMs,
          limit: 50,
          ...(query.targetAfter ? { after: query.targetAfter } : {}),
        }
      : null;
  });
  const read = useMetadataRead(request, (reader, query, options) =>
    reader.listTargetBindings(query, options),
  );
  return (
    <MetadataPanel
      title="Target signal bindings"
      description="Configured bindings targeting this asset. Their presence does not assert that a signal has been observed."
    >
      <MetadataReadContent
        state={read.state()}
        label="target signal bindings"
        retry={read.retry}
      >
        {(page) => (
          <>
            <Show
              when={page.bindings.length > 0}
              fallback={
                <p role="status" class="text-xs text-muted">
                  No bindings appear in this target snapshot page. This does not
                  establish source inventory or telemetry availability.
                </p>
              }
            >
              <BindingRecords
                bindings={page.bindings}
                workspace={props.workspace}
              />
            </Show>
            <MetadataPagination
              workspace={props.workspace}
              path={props.path}
              cursorKey="target_after"
              after={props.workspace.query()?.targetAfter}
              nextAfter={page.nextAfter}
            />
          </>
        )}
      </MetadataReadContent>
    </MetadataPanel>
  );
}
